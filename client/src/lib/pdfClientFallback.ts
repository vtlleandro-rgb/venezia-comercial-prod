/**
 * PDF Client-Side Fallback
 * Gera PDF diretamente no navegador usando html2canvas + jsPDF
 * 
 * Problemas mobile corrigidos:
 * - html2canvas pode falhar em mobile com pouca memória → scale reduzido
 * - Imagens com URLs relativas não carregam → converte para absolute URLs
 * - Safari iOS bloqueia downloads assíncronos → usa Web Share API ou navegação same-tab
 * - Android Chrome → usa blob + anchor link download
 * - Timeout de imagens → fallback graceful se imagens não carregam
 */
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

interface ClientPdfOptions {
  htmlContent: string;
  filename?: string;
}

/**
 * Detecta se é um dispositivo móvel
 */
function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Detecta se é Safari (iOS ou macOS)
 */
function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/**
 * Converte URLs relativas para absolutas no HTML
 */
function makeUrlsAbsolute(html: string): string {
  const origin = window.location.origin;
  // Converter src="/assets/..." para src="https://domain/assets/..."
  return html.replace(
    /src="(\/assets\/[^"]+)"/g,
    `src="${origin}$1"`
  );
}

/**
 * Pré-carrega imagens como base64 para evitar problemas CORS/loading em mobile
 */
async function preloadImagesAsBase64(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll("img");
  const loadPromises = Array.from(images).map(async (img) => {
    try {
      if (img.complete && img.naturalHeight > 0) return;
      
      // Tentar carregar a imagem
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("timeout")), 5000);
        img.onload = () => { clearTimeout(timeout); resolve(); };
        img.onerror = () => { clearTimeout(timeout); reject(new Error("load error")); };
        
        // Forçar recarregamento se necessário
        if (!img.src.startsWith("data:")) {
          const currentSrc = img.src;
          img.src = "";
          img.src = currentSrc;
        }
      });
    } catch {
      // Se imagem falhar, esconder gracefully
      img.style.display = "none";
    }
  });

  await Promise.allSettled(loadPromises);
}

/**
 * Calcula posições de corte de página respeitando elementos com page-break-inside:avoid.
 * Retorna array de offsets Y no canvas (pixels) onde cada página começa/termina.
 */
function computePageBreaks(pageElement: HTMLElement, canvas: HTMLCanvasElement, scale: number): number[] {
  // Altura de uma página A4 em pixels do canvas (proporção 1:√2)
  const a4Ratio = 297 / 210;
  const pageHeightPx = Math.floor(canvas.width * a4Ratio);

  if (canvas.height <= pageHeightPx) return [0, canvas.height];

  // Coletar blocos que não devem ser cortados
  const avoidBreakSelectors = [
    ".bloco-obra", ".bloco-cef", ".corretor-box", ".hero-box",
    ".block", ".signatures", ".header",
  ];
  const avoidElements: Array<{ top: number; bottom: number }> = [];
  const containerRect = pageElement.getBoundingClientRect();

  avoidBreakSelectors.forEach((sel) => {
    pageElement.querySelectorAll(sel).forEach((el) => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      avoidElements.push({
        top: Math.floor((rect.top - containerRect.top) * scale),
        bottom: Math.ceil((rect.bottom - containerRect.top) * scale),
      });
    });
  });

  const cuts: number[] = [0];
  let pageStart = 0;

  while (pageStart < canvas.height) {
    const idealCut = pageStart + pageHeightPx;
    if (idealCut >= canvas.height) {
      cuts.push(canvas.height);
      break;
    }

    // Verificar se o corte ideal cai dentro de um bloco avoid
    let safeCut = idealCut;
    for (const el of avoidElements) {
      if (el.top < idealCut && el.bottom > idealCut) {
        // Corte cai dentro deste bloco — recuar para antes do bloco
        const cutBefore = el.top - 8;
        if (cutBefore > pageStart + pageHeightPx * 0.4) {
          safeCut = cutBefore;
        } else {
          // Bloco muito grande para recuar — avançar para depois do bloco
          safeCut = el.bottom + 8;
        }
        break;
      }
    }

    cuts.push(safeCut);
    pageStart = safeCut;
  }

  return cuts;
}

/**
 * Gera PDF client-side a partir de HTML
 * Usa div oculta no DOM principal (compatível com mobile)
 */
export async function generatePdfClientSide(options: ClientPdfOptions): Promise<void> {
  const { htmlContent, filename = "Proposta-Venezia.pdf" } = options;
  const mobile = isMobileDevice();
  const safari = isSafari();

  // Converter URLs relativas para absolutas
  const absoluteHtml = makeUrlsAbsolute(htmlContent);

  // Criar container oculto no DOM principal (não iframe — evita problemas Safari)
  const container = document.createElement("div");
  container.id = "pdf-render-container";
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 794px;
    z-index: -9999;
    background-color: #ffffff;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
  `;
  document.body.appendChild(container);

  try {
    // Extrair apenas o conteúdo do body do HTML
    const bodyMatch = absoluteHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : absoluteHtml;

    // Extrair estilos
    const styleMatch = absoluteHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    const styles = styleMatch ? styleMatch.map(s => {
      const inner = s.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      return inner ? inner[1] : "";
    }).join("\n") : "";

    // Injetar estilos inline no container
    const styleEl = document.createElement("style");
    styleEl.textContent = styles + `
      /* Forçar visibilidade para captura */
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      img { max-width: 100%; height: auto; }
    `;
    container.appendChild(styleEl);

    // Injetar conteúdo
    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = bodyContent;
    container.appendChild(contentDiv);

    // Pré-carregar imagens (com timeout robusto)
    await preloadImagesAsBase64(container);

    // Delay para renderização completa (mobile precisa de mais tempo)
    await new Promise((r) => setTimeout(r, mobile ? 1000 : 500));

    // Capturar com html2canvas
    const pageElement = container.querySelector(".page") as HTMLElement || contentDiv;
    
    // Escala adaptativa: menor em mobile para evitar crash de memória
    const scale = mobile ? 1.2 : 2;

    const canvas = await html2canvas(pageElement, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: 794,
      windowWidth: 794,
      // Timeout mais generoso para mobile
      ...(mobile ? { imageTimeout: 8000 } : { imageTimeout: 15000 }),
    });

    // Calcular quebras de página respeitando blocos com page-break-inside:avoid
    const pageBreakCuts = computePageBreaks(pageElement, canvas, scale);

    // Gerar PDF com jsPDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Usar JPEG com qualidade adequada para mobile (menor tamanho de arquivo)
    const quality = mobile ? 0.85 : 0.92;

    // Renderizar cada fatia como página separada
    for (let i = 0; i < pageBreakCuts.length - 1; i++) {
      if (i > 0) pdf.addPage();

      const yStart = pageBreakCuts[i];
      const yEnd = pageBreakCuts[i + 1];
      const sliceHeight = yEnd - yStart;

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const ctx = pageCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, sliceHeight);
        ctx.drawImage(
          canvas,
          0, yStart, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight
        );
      }

      const pageImgData = pageCanvas.toDataURL("image/jpeg", quality);
      const pageImgHeight = (sliceHeight / canvas.width) * pdfWidth;
      // Se a fatia for menor que a página PDF, centralizar no topo
      const renderHeight = Math.min(pageImgHeight, pdfHeight);
      pdf.addImage(pageImgData, "JPEG", 0, 0, pdfWidth, renderHeight);
    }

    // Download — estratégia robusta para todos os dispositivos
    await downloadPdf(pdf, filename, mobile, safari);

  } finally {
    // Limpar container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Download do PDF com estratégia específica por dispositivo
 */
async function downloadPdf(pdf: jsPDF, filename: string, mobile: boolean, safari: boolean): Promise<void> {
  const pdfBlob = pdf.output("blob");
  const blobUrl = URL.createObjectURL(pdfBlob);

  try {
    if (safari && mobile) {
      // Safari iOS: Web Share API é a forma mais confiável
      if (navigator.share && navigator.canShare) {
        const file = new File([pdfBlob], filename, { type: "application/pdf" });
        const shareData = { files: [file] };
        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            return;
          } catch {
            // Usuário cancelou — tentar fallback
          }
        }
      }
      
      // Fallback Safari iOS: abrir o PDF inline no navegador
      // Usar window.location.href para navegar para o blob (Safari abre PDFs inline)
      window.location.href = blobUrl;
      // Não revogar URL imediatamente — Safari precisa do blob ativo
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;

    } else if (mobile) {
      // Android Chrome: anchor link com download funciona bem
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      
      // Usar click() síncrono
      link.click();
      
      // Cleanup após delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 10000);
      return;

    } else {
      // Desktop — método padrão jsPDF (mais confiável)
      pdf.save(filename);
      URL.revokeObjectURL(blobUrl);
      return;
    }
  } catch {
    // Último fallback: tentar pdf.save() independente do dispositivo
    try {
      pdf.save(filename);
    } catch {
      // Se tudo falhar, abrir blob URL
      window.open(blobUrl, "_blank");
    }
  }
}
