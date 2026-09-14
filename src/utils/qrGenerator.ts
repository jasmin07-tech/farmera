import QRCode from 'qrcode';

export async function generateFarmPassportQR(farmerId: string, farmName: string): Promise<string> {
  try {
    const payload = JSON.stringify({
      app: 'FarmEra',
      type: 'DIGITAL_FARM_PASSPORT',
      farmerId,
      farm: farmName,
      verified: true,
      timestamp: new Date().toISOString(),
      url: `https://farmera.app/passport/${farmerId}`,
    });

    const dataUrl = await QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#064e3b', // deep emerald forest
        light: '#f0fdf4', // soft mint
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('QR generation failed:', err);
    return '';
  }
}
