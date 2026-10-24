const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(async () => {
  try {
    const baseDir = path.resolve(__dirname, 'HoSo_ThamGia_GiaiThuong_AI_2026');
    
    // 1. Convert Slides (16:9 Landscape)
    console.log('Converting Slides to PDF...');
    const winSlides = new BrowserWindow({
      show: false,
      width: 1920,
      height: 1080,
      webPreferences: { nodeIntegration: false }
    });

    const slidesUrl = 'file:///' + path.join(baseDir, '01_BAI_TRINH_CHIEU_SLIDES.html').replace(/\\/g, '/');
    await winSlides.loadURL(slidesUrl);
    // wait a moment for fonts/images to load
    await new Promise(r => setTimeout(r, 2000));

    const slidesPdf = await winSlides.webContents.printToPDF({
      printBackground: true,
      landscape: true,
      margins: { marginType: 'none' },
      pageSize: 'A4'
    });
    fs.writeFileSync(path.join(baseDir, '01_BAI_TRINH_CHIEU_SLIDES.pdf'), slidesPdf);
    console.log('Slides PDF generated successfully! Size:', slidesPdf.length);

    // 2. Convert Poster (A0 Portrait)
    console.log('Converting Poster A0 to PDF...');
    const winPoster = new BrowserWindow({
      show: false,
      width: 1600,
      height: 2262,
      webPreferences: { nodeIntegration: false }
    });

    const posterUrl = 'file:///' + path.join(baseDir, '02_POSTER_SAN_PHAM_A0.html').replace(/\\/g, '/');
    await winPoster.loadURL(posterUrl);
    await new Promise(r => setTimeout(r, 2000));

    const posterPdf = await winPoster.webContents.printToPDF({
      printBackground: true,
      landscape: false,
      margins: { marginType: 'none' },
      pageSize: 'A0'
    });
    fs.writeFileSync(path.join(baseDir, '02_POSTER_SAN_PHAM_A0.pdf'), posterPdf);
    console.log('Poster A0 PDF generated successfully! Size:', posterPdf.length);

  } catch (err) {
    console.error('Error generating PDF:', err);
  } finally {
    app.quit();
  }
});
