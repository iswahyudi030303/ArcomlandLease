// WhatsApp bot untuk semua user - VIEW ONLY (TIDAK ADA UPDATE)
require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const TelegramBot = require("node-telegram-bot-api");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cron = require('node-cron');

// =============================================
// KONFIGURASI GOOGLE SHEETS
// =============================================
const SPREADSHEET_ID = '1RX_16TpG9gU-t0l_OSRfNay6Ru1tOoHuBlLQlhavyBs';
const SERVICE_ACCOUNT_EMAIL = 'updatespreadsheetapi@arcom2025wildan.iam.gserviceaccount.com';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCiZqGA2j6R/t2C
p2qKQRdcr6ZOrDGxwxgpupsqEbsSpwOT8yR3OIA97LyxgOnZqzlm/AwI2GPvuI2e
KpwHdY/DqX3n1PmiK2KgAHfR/sKKCzdnK7zH2HQRbLQiBi/mHIXiZM0dLWTIZh8L
2qzDfuHKctqULyHIj9imfAPq/FaYzylctDfvWqQ4wwgI9qiW2iN4/DMhO9erwxhK
fyFCa+qbGo58uwUgPSP/Ftv3QIxzMjsuyiob8OAv0Ks1fFU+rhR9lGkFlKp3OJYz
Ytns5wwWBrAJXf56wpaEYXdry8ESwf5H+BikevXB5g0F5TOZ67hs1cJYZTSycmS5
crdQrZwPAgMBAAECggEANqxln9sZqI4MpfFV6WCbjF0oGKFZA5cCOf40QbgBanim
uDbppmdzqSVbq0iSsfC2nQiqxomPL4PKzZ5btBksgrs7g4KMXj/L7sDpld12QgIf
r1CmuAMTpFAb3r6FfqtImZzE/xcqsFrNBfEjK5e6TS1Yj/3EGmDvF7F1ojU8tCm0
pGJq7oWVWQbkdRJBucHrKBZevyLsfe+n7DRJEANcXqSzcMaACRp1EmXi3dqZfPK5
TCE2pyPqexGehWaN1Db6C7COJOPeTcoxVSiVE93JKDVs8sTXaPbDlIMaGob85oW4
G0sBlzlrkF4BpgvTuv39ikV21YPlkJlvSDkvgpfiKQKBgQDYRXqjOJNMDibx0qz0
FwyZS0DcF5Zgs7RZe19cM+S3AsOaNNP8WzPHPEaTTpNmCq84kzkvK0Kf02AEUl7S
grHOSYWNnbvI4hq2dEowrqJzaNN+67/zwfnw8IsZ7WLUS1Xip+NlkHuzHTVGCzk2
QIv9YiN+VLtFT3T9VfVBhCcv1wKBgQDAO81i4V3qmWcbtNl9gF6oa+TVc27+WN1N
JKV+3hTK8t7JwDUiqQh6frp6nL5CozJWnrdk4cOuNiNG792vuKnZppa9f/gsAGEm
37ISUcefHzzj2ZMiEymPLMjJ23m3EbVTi5PIBkDdjMmtRbyl7erL500+eWPCjxwb
P62de7rOiQKBgH86UG0Y6T5CzRJR18E4lgbQSHWxwptc3GoPtAev14r6K0vabCL3
HDzG7tXV0cyj2HS111wyXN1dIg0oz/OTQzqR8elfs4r3yLMxMjv1YEf4kQMHeULT
CFB/kbVM+2jccMgH8DRdjQfP1PlBvQR3cGM9ipfVDN43YiFuoftK3Sq9AoGABx2v
mqtxCJApKvNk4apw1pc331boku3DM2nZ3npmFqUq7hj5XpEXSUGLsaI/wMO9x0sU
yt04myhR4fxbHngdgXsTNWyZSTeyYPgC5X61fwRvApg5RBelgDFONXq0ZLx5E+Ck
1dC1cf4WMR3Vv+awvF+RknB36unVRoTy7lN4NNECgYBU9sFk8/vToURB/t1TjpJi
7an8uAbDHbIHQ+xaeDZofRQb1e/qgaCar2FNEAthWwfG66XThIntFf1r08iiiyab
1I/tqq6SkXOOxLbdP7ZUtvYJqXocbH8YjXd7XWJ/0moNICHinWE+BUwIzK11s1wR
KdYDGWKp6gcwtT3lgJuZTA==
-----END PRIVATE KEY-----`;

// =============================================
// KONFIGURASI LAIN
// =============================================
const CONFIG = {
    // Telegram
    TELEGRAM_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    
    // Reminder Settings
    BAK_DAYS: parseInt(process.env.BAK_REMINDER_DAYS) || 7,
    PKS_DAYS: parseInt(process.env.PKS_REMINDER_DAYS) || 30,
    PKS_3_BULAN: 90,
    
    // Timezone Indonesia (WIB = UTC+7)
    TIMEZONE: "Asia/Jakarta",
    
    // PIC Data (untuk Telegram reminder saja)
    PICS: {
        AFRIZAL: { 
            name: 'Afrizal', 
            tele: process.env.AFRIZAL_TELE,
            type: 'PIC'
        },
        DONNY: { 
            name: 'Donny Yulianto', 
            tele: process.env.DONNY_TELE,
            type: 'PIC'
        },
        LINGGA: { 
            name: 'Lingga Baidillah', 
            tele: process.env.LINGGA_TELE,
            type: 'PIC'
        },
        SPV: { 
            name: 'Supervisor', 
            tele: process.env.SPV_TELE,
            type: 'MANAGEMENT'
        },
        RM: { 
            name: 'Relationship Manager', 
            tele: process.env.RM_TELE,
            type: 'MANAGEMENT'
        }
    }
};

// =============================================
// INISIALISASI BOT TELEGRAM & WHATSAPP
// =============================================
const teleBot = new TelegramBot(CONFIG.TELEGRAM_TOKEN, { polling: true });

// WhatsApp Client - VIEW ONLY
const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    },
});

// Database sederhana untuk user registration
const userDatabase = new Map();

// =============================================
// FUNGSI UTILITY DENGAN TIMEZONE INDONESIA
// =============================================
function getWaktuIndonesia() {
    const now = new Date();
    // WIB = UTC+7
    const wibTime = new Date;
    return wibTime;
}

function formatWaktu(date, includeTime = false) {
    if (!date) return '-';
    try {
        const options = {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.second = '2-digit';
        }
        
        return date.toLocaleDateString('id-ID', options) + 
               (includeTime ? ' WIB' : '');
    } catch {
        return '-';
    }
}

function formatTanggal(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    } catch {
        return '-';
    }
}

function parseTanggal(tanggalStr) {
    if (!tanggalStr || tanggalStr.trim() === '') {
        return null;
    }
    
    try {
        const bulanMap = {
            'Jan': 'Jan', 'Januari': 'Jan',
            'Feb': 'Feb', 'Februari': 'Feb', 
            'Mar': 'Mar', 'Maret': 'Mar',
            'Apr': 'Apr', 'April': 'Apr',
            'Mei': 'May', 'May': 'May',
            'Jun': 'Jun', 'Juni': 'Jun',
            'Jul': 'Jul', 'Juli': 'Jul',
            'Agu': 'Aug', 'Agustus': 'Aug', 'Aug': 'Aug',
            'Sep': 'Sep', 'September': 'Sep',
            'Okt': 'Oct', 'Oktober': 'Oct', 'Oct': 'Oct',
            'Nov': 'Nov', 'November': 'Nov',
            'Des': 'Dec', 'Desember': 'Dec', 'Dec': 'Dec'
        };
        
        let cleanDate = tanggalStr.toString().trim();
        
        if (cleanDate.includes('-')) {
            const parts = cleanDate.split('-');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const monthId = parts[1].substring(0, 3);
                const year = parts[2];
                
                const monthEn = bulanMap[monthId] || monthId;
                const dateStr = `${day} ${monthEn} ${year}`;
                const parsedDate = new Date(dateStr);
                
                if (!isNaN(parsedDate.getTime())) {
                    return parsedDate;
                }
            }
        }
        
        const parsedDate = new Date(cleanDate);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
        
        return null;
    } catch {
        return null;
    }
}

function hitungHariMenuju(tanggal) {
    if (!tanggal) return 0;
    try {
        const target = new Date(tanggal);
        const sekarang = getWaktuIndonesia();
        const selisih = target - sekarang;
        return Math.floor(selisih / (1000 * 60 * 60 * 24));
    } catch {
        return 0;
    }
}

function hitungHariLewat(tanggal) {
    if (!tanggal) return 0;
    try {
        const target = new Date(tanggal);
        const sekarang = getWaktuIndonesia();
        const selisih = sekarang - target;
        return Math.floor(selisih / (1000 * 60 * 60 * 24));
    } catch {
        return 0;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================
// FUNGSI WHATSAPP - VIEW ONLY
// =============================================

async function kirimWhatsApp(nomor, pesan) {
    try {
        const formattedNumber = nomor.includes('@c.us') ? nomor : `${nomor}@c.us`;
        
        await whatsappClient.sendMessage(formattedNumber, pesan);
        console.log(`✅ WhatsApp terkirim ke ${nomor}`);
        return true;
    } catch (error) {
        console.error(`❌ Gagal kirim WhatsApp ke ${nomor}:`, error.message);
        return false;
    }
}

function getUserInfo(nomor) {
    if (userDatabase.has(nomor)) {
        return userDatabase.get(nomor);
    }
    return { name: 'User', role: 'UNREGISTERED' };
}

// Menu utama yang sederhana
async function tampilkanMenuUtama(nomor) {
    const userInfo = getUserInfo(nomor);
    const userName = userInfo.name;
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    
    const menu = `🤖 *Halo ${userName}!*\n` +
        `*BOT MONITORING BAK & PKS*\n` +
        `*(VIEW ONLY - DATA SAJA)*\n` +
        `🕐 ${waktuSekarang}\n\n` +
        `*📊 LAPORAN & MONITORING:*\n` +
        `1️⃣ Semua Site\n` +
        `2️⃣ Per PIC (Afrizal/Donny/Lingga)\n` +
        `3️⃣ Cari Site Spesifik\n` +
        `4️⃣ Prioritas Tinggi\n` +
        `5️⃣ PKS Lewat\n` +
        `6️⃣ PKS Kritis (<7 hari)\n` +
        `7️⃣ Belum Ada BAK\n\n` +
        `*📈 SUMMARY & STATISTIK:*\n` +
        `8️⃣ Summary Per PIC\n` +
        `9️⃣ Summary Overall\n` +
        `🔟 Status Keseluruhan\n` +
        `1️⃣1️⃣ Statistik Detail\n\n` +
        `*👤 PROFILE & SETTING:*\n` +
        `1️⃣2️⃣ Lihat Profile\n` +
        `1️⃣3️⃣ Ganti Nama\n` +
        `1️⃣4️⃣ Subscribe Report\n` +
        `1️⃣5️⃣ Unsubscribe Report\n\n` +
        `*❓ BANTUAN & INFO:*\n` +
        `1️⃣6️⃣ Panduan Lengkap\n` +
        `1️⃣7️⃣ Registrasi User Baru\n` +
        `1️⃣8️⃣ Info Sistem\n` +
        `1️⃣9️⃣ Jam Server\n\n` +
        `📌 *CARA PAKAI:*\n` +
        `Ketik angka (1-19) langsung:\n` +
        `• Contoh: "1" untuk Semua Site\n` +
        `• Contoh: "2 A" untuk PIC Afrizal\n` +
        `• Contoh: "3 SITE123" untuk cari site\n\n` +
        `Atau ketik:\n` +
        `• "MENU" - Tampilkan menu ini\n` +
        `• "HELP" - Panduan\n` +
        `• "LIST" - Daftar site\n` +
        `• "STATUS" - Status keseluruhan\n` +
        `• "TIME" - Cek waktu server`;
    
    await kirimWhatsApp(nomor, menu);
}

// Fungsi utama untuk memproses pesan WhatsApp
async function prosesPesanWhatsApp(pengirim, pesan) {
    try {
        const pesanClean = pesan.trim();
        const pesanUpper = pesanClean.toUpperCase();
        
        console.log(`📱 WhatsApp dari ${pengirim}: ${pesanClean}`);
        
        // Handle jika belum terdaftar (kecuali perintah tertentu)
        if (!userDatabase.has(pengirim) && 
            !pesanUpper.startsWith('REGISTER') && 
            !['16', '17', '18', '19', 'TIME', 'HELP'].includes(pesanUpper)) {
            await kirimWhatsApp(pengirim,
                `👋 *SELAMAT DATANG!*\n\n` +
                `Anda belum terdaftar. Silakan registrasi dulu:\n\n` +
                `Ketik: *17* atau *REGISTER [NAMA_LENGKAP]*\n` +
                `Contoh: REGISTER Afrizal\n\n` +
                `Atau ketik *16* untuk panduan.`
            );
            return;
        }
        
        // Handle perintah khusus
        if (pesanUpper === 'TIME' || pesanUpper === 'JAM' || pesanUpper === '19') {
            const waktuServer = new Date();
            const waktuWIB = getWaktuIndonesia();
            
            await kirimWhatsApp(pengirim,
                `🕐 *INFORMASI WAKTU SERVER*\n\n` +
                `Server Time: ${waktuServer.toLocaleString('id-ID')}\n` +
                `WIB (UTC+7): ${formatWaktu(waktuWIB, true)}\n` +
                `Timezone: Asia/Jakarta\n\n` +
                `📅 Report otomatis:\n` +
                `• Startup: Saat sistem hidup\n` +
                `• Pagi: 08:00 WIB\n` +
                `• Sore: 17:00 WIB\n` +
                `• Tengah Hari: 12:00 WIB`
            );
            return;
        }
        
        if (pesanUpper === 'MENU' || pesanUpper === 'HOME' || pesanUpper === 'BACK') {
            await tampilkanMenuUtama(pengirim);
            return;
        }
        
        if (pesanUpper === 'HELP' || pesanUpper === 'BANTUAN' || pesanUpper === '16') {
            await tampilkanHelp(pengirim);
            return;
        }
        
        if (pesanUpper === 'LIST') {
            const semuaData = await bacaDataSpreadsheet();
            await kirimDaftarSite(pengirim, semuaData);
            return;
        }
        
        if (pesanUpper === 'STATUS') {
            const semuaData = await bacaDataSpreadsheet();
            const prioritized = prioritaskanSite(semuaData);
            await kirimStatusKeseluruhan(pengirim, semuaData, prioritized);
            return;
        }
        
        if (pesanUpper === '18' || pesanUpper === 'INFO') {
            await tampilkanInfoSistem(pengirim);
            return;
        }
        
        // Handle registrasi
        if (pesanUpper.startsWith('REGISTER') || pesanUpper === '17') {
            await handleRegistrasi(pengirim, pesanClean, pesanUpper);
            return;
        }
        
        // Handle subscribe/unsubscribe report
        if (pesanUpper === '14' || pesanUpper === 'SUBSCRIBE') {
            userDatabase.set(pengirim, {
                ...getUserInfo(pengirim),
                subscribeReport: true,
                subscribedAt: new Date().toISOString()
            });
            
            await kirimWhatsApp(pengirim,
                `✅ *BERLANGGANAN REPORT*\n\n` +
                `Anda sekarang berlangganan report harian.\n\n` +
                `📅 *JADWAL REPORT:*\n` +
                `• Startup: Saat sistem hidup\n` +
                `• Pagi: 08:00 WIB\n` +
                `• Sore: 17:00 WIB\n\n` +
                `📝 Report akan dikirim via WhatsApp.\n` +
                `Ketik *15* untuk berhenti berlangganan.`
            );
            return;
        }
        
        if (pesanUpper === '15' || pesanUpper === 'UNSUBSCRIBE') {
            userDatabase.set(pengirim, {
                ...getUserInfo(pengirim),
                subscribeReport: false
            });
            
            await kirimWhatsApp(pengirim,
                `❌ *BERHENTI BERLANGGANAN*\n\n` +
                `Anda berhenti berlangganan report harian.\n\n` +
                `Anda masih bisa:\n` +
                `• Ketik MENU untuk lihat data\n` +
                `• Request report manual kapan saja\n` +
                `• Ketik 14 untuk berlangganan lagi`
            );
            return;
        }
        
        // Handle pilihan angka
        const semuaData = await bacaDataSpreadsheet();
        const prioritized = prioritaskanSite(semuaData);
        
        // Ekstrak angka dari pesan
        const match = pesanClean.match(/^(\d+)/);
        if (!match) {
            await kirimWhatsApp(pengirim,
                `🤖 *BOT MONITORING*\n\n` +
                `Ketik angka 1-19 untuk pilihan:\n` +
                `• 1-7: Laporan & Monitoring\n` +
                `• 8-11: Summary & Statistik\n` +
                `• 12-15: Profile & Setting\n` +
                `• 16-19: Bantuan & Info\n\n` +
                `Ketik *MENU* untuk semua pilihan.`
            );
            return;
        }
        
        const pilihan = parseInt(match[1]);
        const args = pesanClean.substring(match[0].length).trim().split(/\s+/);
        
        switch(pilihan) {
            // LAPORAN & MONITORING
            case 1: // Semua Site
                await kirimLaporanSemua(pengirim, semuaData);
                break;
                
            case 2: // Per PIC
                await handleLaporanPerPic(pengirim, args, semuaData);
                break;
                
            case 3: // Site Spesifik
                await handleCariSite(pengirim, args[0] || '', semuaData);
                break;
                
            case 4: // Prioritas Tinggi
                await kirimLaporanPrioritas(pengirim, semuaData);
                break;
                
            case 5: // PKS Lewat
                await kirimStatusPksLewat(pengirim, prioritized);
                break;
                
            case 6: // PKS Kritis
                await kirimStatusPksKritis(pengirim, prioritized);
                break;
                
            case 7: // Belum Ada BAK
                await kirimStatusBelumBAK(pengirim, prioritized);
                break;
                
            // SUMMARY & STATISTIK
            case 8: // Summary Per PIC
                await kirimSummaryPerPic(pengirim, semuaData);
                break;
                
            case 9: // Summary Overall
                await kirimSummaryOverall(pengirim, semuaData);
                break;
                
            case 10: // Status Keseluruhan
                await kirimStatusKeseluruhan(pengirim, semuaData, prioritized);
                break;
                
            case 11: // Statistik Detail
                await kirimStatistikDetail(pengirim, semuaData);
                break;
                
            // PROFILE & SETTING
            case 12: // Lihat Profile
                await handleProfile(pengirim);
                break;
                
            case 13: // Ganti Nama
                await handleGantiNama(pengirim, args);
                break;
                
            case 14: // Subscribe Report
                // Sudah dihandle di atas
                break;
                
            case 15: // Unsubscribe Report
                // Sudah dihandle di atas
                break;
                
            // BANTUAN & INFO
            case 16: // Panduan Lengkap
                await tampilkanHelp(pengirim);
                break;
                
            case 17: // Registrasi User Baru
                // Sudah dihandle di atas
                break;
                
            case 18: // Info Sistem
                await tampilkanInfoSistem(pengirim);
                break;
                
            case 19: // Jam Server
                // Sudah dihandle di atas
                break;
                
            default:
                await kirimWhatsApp(pengirim,
                    `❌ Pilihan tidak valid.\n` +
                    `Ketik *MENU* untuk melihat pilihan 1-19.\n` +
                    `Ketik *16* untuk panduan.`
                );
        }
        
    } catch (error) {
        console.error('❌ Error proses WhatsApp:', error);
        await kirimWhatsApp(pengirim,
            `❌ Terjadi error: ${error.message}\n` +
            `Silakan coba lagi atau ketik MENU.`
        );
    }
}

// =============================================
// FUNGSI REGISTRASI
// =============================================
async function handleRegistrasi(pengirim, pesanClean, pesanUpper) {
    if (pesanUpper === '17') {
        await kirimWhatsApp(pengirim,
            `📝 *REGISTRASI USER BARU*\n\n` +
            `Ketik: REGISTER [NAMA_LENGKAP]\n` +
            `Contoh: REGISTER Afrizal\n\n` +
            `Setelah registrasi, Anda bisa:\n` +
            `• Melihat data BAK & PKS\n` +
            `• Subscribe report harian\n` +
            `• Monitoring status site`
        );
        return;
    }
    
    if (userDatabase.has(pengirim)) {
        const userInfo = getUserInfo(pengirim);
        await kirimWhatsApp(pengirim,
            `✅ Anda sudah terdaftar sebagai ${userInfo.name}.\n` +
            `Gunakan MENU untuk melihat data monitoring.`
        );
        return;
    }
    
    const nama = pesanClean.substring(8).trim();
    if (nama.length < 2) {
        await kirimWhatsApp(pengirim,
            `❌ Nama terlalu pendek.\n` +
            `Format: REGISTER [NAMA_LENGKAP]\n` +
            `Contoh: REGISTER Afrizal`
        );
        return;
    }
    
    userDatabase.set(pengirim, { 
        name: nama, 
        role: 'USER',
        registeredAt: new Date().toISOString(),
        subscribeReport: false
    });
    
    await kirimWhatsApp(pengirim,
        `✅ *Registrasi Berhasil!*\n\n` +
        `Halo ${nama}, selamat datang!\n\n` +
        `🤖 *FITUR BOT:*\n` +
        `• Melihat data BAK & PKS\n` +
        `• Monitoring status site\n` +
        `• Cek prioritas & reminder\n\n` +
        `📅 *REPORT OTOMATIS:*\n` +
        `Ketik 14 untuk subscribe report harian\n\n` +
        `📝 *CATATAN:*\n` +
        `• Update data dilakukan manual oleh SPV/PIC\n` +
        `• Bot hanya untuk monitoring/view only\n\n` +
        `Ketik *MENU* atau angka *1* untuk mulai.`
    );
    
    await notifyAdmin(`📝 User baru terdaftar:\nNama: ${nama}\nNomor: ${pengirim}`);
}

// =============================================
// FUNGSI LAPORAN & MONITORING (VIEW ONLY)
// =============================================

async function kirimLaporanSemua(pengirim, semuaData) {
    const prioritized = prioritaskanSite(semuaData);
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    
    let pesan = `📊 *LAPORAN SEMUA SITE*\n` +
               `🕐 ${waktuSekarang}\n\n` +
               `Total Site: ${semuaData.length}\n\n` +
               `📈 *STATUS PRIORITAS:*\n` +
               `🔴 PKS Lewat: ${prioritized.pksLewat.length}\n` +
               `🚨 PKS <7 Hari: ${prioritized.pksKritis.length}\n` +
               `⚠️ PKS 7-30 Hari: ${prioritized.pksMendekati.length}\n` +
               `📅 PKS 3 Bulan: ${prioritized.pks3Bulan.length}\n` +
               `📋 Belum BAK: ${prioritized.belumAdaBAK.length}\n\n`;
    
    // Site dengan PKS lewat (maks 5)
    if (prioritized.pksLewat.length > 0) {
        pesan += `🔴 *PKS SUDAH LEWAT (${prioritized.pksLewat.length} site):*\n`;
        prioritized.pksLewat.slice(0, 5).forEach((site, i) => {
            const hariLewat = hitungHariLewat(site.pksDateEnds);
            pesan += `${i+1}. ${site.siteName} (${site.siteId})\n`;
            pesan += `   PIC: ${site.picLandlease}\n`;
            pesan += `   Lewat: ${hariLewat} hari\n`;
            pesan += `   Status: ${site.statusPKS || 'NY'}\n\n`;
        });
        
        if (prioritized.pksLewat.length > 5) {
            pesan += `... dan ${prioritized.pksLewat.length - 5} site lainnya\n\n`;
        }
    }
    
    pesan += `📝 *CATATAN:*\n` +
            `Update data dilakukan manual oleh SPV/PIC\n\n` +
            `Ketik *4* untuk laporan prioritas lengkap`;
    
    await kirimWhatsApp(pengirim, pesan);
}

async function handleLaporanPerPic(pengirim, args, semuaData) {
    if (args.length === 0) {
        await kirimWhatsApp(pengirim,
            `👤 *LAPORAN PER PIC*\n\n` +
            `Pilih PIC:\n` +
            `• 2 A - Afrizal\n` +
            `• 2 D - Donny Yulianto\n` +
            `• 2 L - Lingga Baidillah\n\n` +
            `Contoh: "2 A" untuk laporan Afrizal`
        );
        return;
    }
    
    let picName = '';
    switch(args[0].toUpperCase()) {
        case 'A':
            picName = 'Afrizal';
            break;
        case 'D':
            picName = 'Donny Yulianto';
            break;
        case 'L':
            picName = 'Lingga Baidillah';
            break;
        default:
            await kirimWhatsApp(pengirim,
                `❌ PIC tidak dikenali.\n` +
                `Pilih: A (Afrizal), D (Donny), L (Lingga)\n` +
                `Contoh: "2 A"`
            );
            return;
    }
    
    const sitesPic = semuaData.filter(site => site.picLandlease === picName);
    
    if (sitesPic.length === 0) {
        await kirimWhatsApp(pengirim,
            `📊 *LAPORAN PIC ${picName}*\n\n` +
            `Tidak ada data untuk PIC ${picName}.\n\n` +
            `Ketik *1* untuk laporan semua site.`
        );
        return;
    }
    
    const prioritized = prioritaskanSite(sitesPic);
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    
    let pesan = `📊 *LAPORAN PIC ${picName}*\n` +
               `🕐 ${waktuSekarang}\n\n` +
               `Total Site: ${sitesPic.length}\n\n` +
               `📈 *STATUS:*\n` +
               `🔴 PKS Lewat: ${prioritized.pksLewat.length}\n` +
               `🚨 PKS <7 Hari: ${prioritized.pksKritis.length}\n` +
               `⚠️ PKS 7-30 Hari: ${prioritized.pksMendekati.length}\n\n`;
    
    // Detail site (maks 8)
    if (sitesPic.length > 0) {
        const maxDisplay = Math.min(sitesPic.length, 8);
        pesan += `📋 *SITE (${maxDisplay} teratas):*\n\n`;
        sitesPic.slice(0, maxDisplay).forEach((site, i) => {
            pesan += `${i+1}. ${site.siteName} (${site.siteId})\n`;
            pesan += `   PKS Ends: ${formatTanggal(site.pksDateEnds)}\n`;
            
            const hariMenuju = hitungHariMenuju(site.pksDateEnds);
            const hariLewat = hitungHariLewat(site.pksDateEnds);
            
            if (hariLewat > 0) {
                pesan += `   ⏰ LEWAT ${hariLewat} HARI\n`;
            } else if (hariMenuju <= 7) {
                pesan += `   🚨 ${hariMenuju} HARI LAGI\n`;
            } else if (hariMenuju <= 30) {
                pesan += `   ⚠️ ${hariMenuju} HARI LAGI\n`;
            } else {
                pesan += `   ✅ ${hariMenuju} HARI LAGI\n`;
            }
            
            pesan += `   Status: ${site.statusPKS || 'NY'}\n\n`;
        });
        
        if (sitesPic.length > 8) {
            pesan += `... dan ${sitesPic.length - 8} site lainnya.\n`;
        }
    }
    
    pesan += `\n📝 *INFO:*\n` +
            `Untuk update data, hubungi PIC/SPV terkait`;
    
    await kirimWhatsApp(pengirim, pesan);
}

async function handleCariSite(pengirim, siteId, semuaData) {
    if (!siteId) {
        await kirimDaftarSite(pengirim, semuaData);
        return;
    }
    
    const site = semuaData.find(s => 
        s.siteId.toUpperCase() === siteId.toUpperCase()
    );
    
    if (site) {
        const hariMenuju = hitungHariMenuju(site.pksDateEnds);
        const hariLewat = hitungHariLewat(site.pksDateEnds);
        const waktuUpdate = formatWaktu(getWaktuIndonesia(), true);
        
        let statusWaktu = '';
        if (hariLewat > 0) {
            statusWaktu = `🔴 LEWAT ${hariLewat} HARI`;
        } else if (hariMenuju <= 7) {
            statusWaktu = `🚨 ${hariMenuju} HARI LAGI`;
        } else if (hariMenuju <= 30) {
            statusWaktu = `⚠️ ${hariMenuju} HARI LAGI`;
        } else {
            statusWaktu = `✅ ${hariMenuju} HARI LAGI`;
        }
        
        const detailSite = `🔍 *DETAIL SITE*\n` +
                         `🕐 ${waktuUpdate}\n\n` +
                         `*Site ID:* ${site.siteId}\n` +
                         `*Site Name:* ${site.siteName}\n` +
                         `*Province:* ${site.province}\n` +
                         `*PIC:* ${site.picLandlease}\n\n` +
                         `*BAK:*\n` +
                         `  Tanggal: ${formatTanggal(site.tanggalBAK)}\n` +
                         `  Status: ${site.statusBAK || 'NY'}\n\n` +
                         `*PKS:*\n` +
                         `  Date Ends: ${formatTanggal(site.pksDateEnds)}\n` +
                         `  Status: ${site.statusPKS || 'NY'}\n` +
                         `  ${statusWaktu}\n\n` +
                         `*Progress:* ${site.progressPembayaran || '-'}\n` +
                         `*Dokumen:* ${site.detailKekuranganDokumen || '-'}\n\n` +
                         `📝 *CATATAN:*\n` +
                         `Update data dilakukan manual oleh SPV/PIC\n\n` +
                         `Ketik *3 [SITE_ID]* untuk cari site lain`;
        
        await kirimWhatsApp(pengirim, detailSite);
    } else {
        await kirimWhatsApp(pengirim, 
            `❌ Site ID "${siteId}" tidak ditemukan.\n` +
            `Ketik "LIST" atau "3" untuk melihat daftar site.`
        );
    }
}

async function kirimDaftarSite(pengirim, semuaData) {
    let daftarSite = `📋 *DAFTAR SITE (20 teratas):*\n\n`;
    
    semuaData.slice(0, 20).forEach((site, i) => {
        daftarSite += `${i+1}. ${site.siteId} - ${site.siteName}\n`;
        daftarSite += `   PIC: ${site.picLandlease}\n`;
        
        const hariMenuju = hitungHariMenuju(site.pksDateEnds);
        const hariLewat = hitungHariLewat(site.pksDateEnds);
        
        if (hariLewat > 0) {
            daftarSite += `   🔴 PKS LEWAT ${hariLewat} HARI\n`;
        } else if (hariMenuju <= 7) {
            daftarSite += `   🚨 ${hariMenuju} HARI LAGI\n`;
        } else if (hariMenuju <= 30) {
            daftarSite += `   ⚠️ ${hariMenuju} HARI LAGI\n`;
        } else {
            daftarSite += `   ✅ ${hariMenuju} HARI LAGI\n`;
        }
        
        daftarSite += `\n`;
    });
    
    if (semuaData.length > 20) {
        daftarSite += `... dan ${semuaData.length - 20} site lainnya.\n\n`;
    }
    
    daftarSite += `*CARI SITE:*\n` +
                 `Ketik: "3 SITE123"\n` +
                 `Contoh: "3 ${semuaData[0]?.siteId || 'SITE123'}"\n\n` +
                 `*INFO:* Total ${semuaData.length} site`;
    
    await kirimWhatsApp(pengirim, daftarSite);
}

async function kirimLaporanPrioritas(pengirim, semuaData) {
    const prioritized = prioritaskanSite(semuaData);
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    
    let pesan = `🚨 *LAPORAN PRIORITAS TINGGI*\n` +
               `🕐 ${waktuSekarang}\n\n`;
    
    if (prioritized.pksLewat.length > 0) {
        pesan += `🔴 *PKS SUDAH LEWAT (${prioritized.pksLewat.length}):*\n`;
        prioritized.pksLewat.slice(0, 10).forEach((site, i) => {
            const hariLewat = hitungHariLewat(site.pksDateEnds);
            pesan += `${i+1}. ${site.siteName} (${site.siteId})\n`;
            pesan += `   PIC: ${site.picLandlease}\n`;
            pesan += `   Lewat: ${hariLewat} hari\n`;
            pesan += `   Status: ${site.statusPKS || 'NY'}\n\n`;
        });
        
        if (prioritized.pksLewat.length > 10) {
            pesan += `... dan ${prioritized.pksLewat.length - 10} site lainnya\n\n`;
        }
    }
    
    if (prioritized.pksKritis.length > 0) {
        pesan += `🚨 *PKS KRITIS <7 HARI (${prioritized.pksKritis.length}):*\n`;
        prioritized.pksKritis.slice(0, 8).forEach((site, i) => {
            const hariMenuju = hitungHariMenuju(site.pksDateEnds);
            pesan += `${i+1}. ${site.siteName} (${site.siteId})\n`;
            pesan += `   PIC: ${site.picLandlease}\n`;
            pesan += `   ${hariMenuju} hari lagi\n`;
            pesan += `   Status: ${site.statusPKS || 'NY'}\n\n`;
        });
        
        if (prioritized.pksKritis.length > 8) {
            pesan += `... dan ${prioritized.pksKritis.length - 8} site lainnya\n\n`;
        }
    }
    
    if (prioritized.belumAdaBAK.length > 0) {
        pesan += `📋 *BELUM ADA BAK (${prioritized.belumAdaBAK.length}):*\n`;
        prioritized.belumAdaBAK.slice(0, 5).forEach((site, i) => {
            pesan += `${i+1}. ${site.siteName} (${site.siteId})\n`;
            pesan += `   PIC: ${site.picLandlease}\n`;
            pesan += `   Province: ${site.province}\n\n`;
        });
    }
    
    if (pesan === `🚨 *LAPORAN PRIORITAS TINGGI*\n🕐 ${waktuSekarang}\n\n`) {
        pesan += `✅ Tidak ada site dengan prioritas tinggi saat ini.`;
    } else {
        pesan += `📝 *CATATAN:*\n` +
                `• Update data dilakukan manual\n` +
                `• Hubungi PIC/SPV untuk update\n` +
                `• Prioritas dihitung otomatis`;
    }
    
    await kirimWhatsApp(pengirim, pesan);
}

// =============================================
// FUNGSI STATUS (VIEW ONLY)
// =============================================

async function kirimStatusPksLewat(pengirim, prioritized) {
    if (prioritized.pksLewat.length === 0) {
        await kirimWhatsApp(pengirim, 
            `✅ Tidak ada PKS yang sudah lewat.\n\n` +
            `Ketik *4* untuk laporan prioritas lengkap`
        );
        return;
    }
    
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    
    let pesan = `🔴 *PKS SUDAH LEWAT (${prioritized.pksLewat.length} site):*\n` +
               `🕐 ${waktuSekarang}\n\n`;
    
    prioritized.pksLewat.slice(0, 10).forEach((site, i) => {
        const hariLewat = hitungHariLewat(site.pksDateEnds);
        pesan += `${i+1}. ${site.siteName} (${site.siteId})\n`;
        pesan += `   PIC: ${site.picLandlease}\n`;
        pesan += `   Lewat: ${hariLewat} hari\n`;
        pesan += `   Status: ${site.statusPKS || 'NY'}\n\n`;
    });
    
    if (prioritized.pksLewat.length > 10) {
        pesan += `... dan ${prioritized.pksLewat.length - 10} site lainnya.\n`;
    }
    
    pesan += `\n📝 *INFO:*\n` +
            `Segera hubungi PIC terkait untuk perpanjangan PKS`;
    
    await kirimWhatsApp(pengirim, pesan);
}

async function kirimStatusPksKritis(pengirim, prioritized) {
    if (prioritized.pksKritis.length === 0) {
        await kirimWhatsApp(pengirim, 
            `✅ Tidak ada PKS yang kritis (<7 hari lagi).\n\n` +
            `Ketik *4* untuk laporan prioritas lengkap`
        );
        return;
    }
    
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    
    let pesan = `🚨 *PKS KRITIS <7 HARI (${prioritized.pksKritis.length} site):*\n` +
               `🕐 ${waktuSekarang}\n\n`;
    
    prioritized.pksKritis.slice(0, 10).forEach((site, i) => {
        const hariMenuju = hitungHariMenuju(site.pksDateEnds);
        pesan += `${i+1}. ${site.siteName} (${site.siteId})\n`;
        pesan += `   PIC: ${site.picLandlease}\n`;
        pesan += `   ${hariMenuju} hari lagi\n`;
        pesan += `   Status: ${site.statusPKS || 'NY'}\n\n`;
    });
    
    if (prioritized.pksKritis.length > 10) {
        pesan += `... dan ${prioritized.pksKritis.length - 10} site lainnya.\n`;
    }
    
    pesan += `\n📝 *INFO:*\n` +
            `Segera proses perpanjangan PKS`;
    
    await kirimWhatsApp(pengirim, pesan);
}

async function kirimStatusBelumBAK(pengirim, prioritized) {
    if (prioritized.belumAdaBAK.length === 0) {
        await kirimWhatsApp(pengirim, 
            `✅ Semua site sudah memiliki BAK.\n\n` +
            `Ketik *4* untuk laporan prioritas lengkap`
        );
        return;
    }
    
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    
    let pesan = `📋 *BELUM ADA BAK (${prioritized.belumAdaBAK.length} site):*\n` +
               `🕐 ${waktuSekarang}\n\n`;
    
    prioritized.belumAdaBAK.slice(0, 10).forEach((site, i) => {
        pesan += `${i+1}. ${site.siteName} (${site.siteId})\n`;
        pesan += `   PIC: ${site.picLandlease}\n`;
        pesan += `   Province: ${site.province}\n\n`;
    });
    
    if (prioritized.belumAdaBAK.length > 10) {
        pesan += `... dan ${prioritized.belumAdaBAK.length - 10} site lainnya.\n`;
    }
    
    pesan += `\n📝 *INFO:*\n` +
            `Segera proses BAK untuk site-site di atas`;
    
    await kirimWhatsApp(pengirim, pesan);
}

// =============================================
// FUNGSI SUMMARY & STATISTIK
// =============================================

async function kirimSummaryPerPic(pengirim, semuaData) {
    // Hitung per PIC
    const summaryPIC = {};
    semuaData.forEach(site => {
        const pic = site.picLandlease;
        if (!summaryPIC[pic]) {
            summaryPIC[pic] = { 
                total: 0, 
                pksLewat: 0, 
                pksKritis: 0,
                pksMendekati: 0,
                belumBAK: 0
            };
        }
        summaryPIC[pic].total++;
        
        const hariMenuju = hitungHariMenuju(site.pksDateEnds);
        const hariLewat = hitungHariLewat(site.pksDateEnds);
        
        if (hariLewat > 0) summaryPIC[pic].pksLewat++;
        else if (hariMenuju <= 7) summaryPIC[pic].pksKritis++;
        else if (hariMenuju <= 30) summaryPIC[pic].pksMendekati++;
        
        // Cek belum ada BAK
        const noTanggalBAK = !site.tanggalBAK || site.tanggalBAK === 'Invalid Date' || site.tanggalBAK.toString().trim() === '';
        const statusNY = site.statusBAK === 'NY' || !site.statusBAK || site.statusBAK.includes('NY');
        if (noTanggalBAK && statusNY) {
            summaryPIC[pic].belumBAK++;
        }
    });
    
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    
    let pesan = `📊 *SUMMARY PER PIC*\n` +
               `🕐 ${waktuSekarang}\n\n`;
    
    for (const [pic, data] of Object.entries(summaryPIC)) {
        pesan += `👤 *${pic}:*\n`;
        pesan += `   Total Site: ${data.total}\n`;
        pesan += `   🔴 PKS Lewat: ${data.pksLewat}\n`;
        pesan += `   🚨 PKS Kritis: ${data.pksKritis}\n`;
        pesan += `   ⚠️  PKS Mendekati: ${data.pksMendekati}\n`;
        pesan += `   📋 Belum BAK: ${data.belumBAK}\n\n`;
    }
    
    pesan += `📝 *CATATAN:*\n` +
            `Data monitoring real-time dari Google Sheets`;
    
    await kirimWhatsApp(pengirim, pesan);
}

async function kirimSummaryOverall(pengirim, semuaData) {
    const prioritized = prioritaskanSite(semuaData);
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    
    let pesan = `📈 *SUMMARY OVERALL*\n` +
               `🕐 ${waktuSekarang}\n\n` +
               `Total Site: ${semuaData.length}\n\n`;
    
    pesan += `*STATUS PRIORITAS:*\n`;
    pesan += `🔴 PKS Lewat: ${prioritized.pksLewat.length}\n`;
    pesan += `🚨 PKS Kritis: ${prioritized.pksKritis.length}\n`;
    pesan += `⚠️ PKS Mendekati: ${prioritized.pksMendekati.length}\n`;
    pesan += `📅 PKS 3 Bulan: ${prioritized.pks3Bulan.length}\n`;
    pesan += `📋 Belum BAK: ${prioritized.belumAdaBAK.length}\n\n`;
    
    // Hitung status BAK dan PKS
    const statusBAKCount = {};
    const statusPKSCount = {};
    
    semuaData.forEach(site => {
        const statusBAK = site.statusBAK || 'NY';
        const statusPKS = site.statusPKS || 'NY';
        
        statusBAKCount[statusBAK] = (statusBAKCount[statusBAK] || 0) + 1;
        statusPKSCount[statusPKS] = (statusPKSCount[statusPKS] || 0) + 1;
    });
    
    pesan += `*STATUS BAK:*\n`;
    for (const [status, count] of Object.entries(statusBAKCount)) {
        pesan += `• ${status}: ${count}\n`;
    }
    
    pesan += `\n*STATUS PKS:*\n`;
    for (const [status, count] of Object.entries(statusPKSCount)) {
        pesan += `• ${status}: ${count}\n`;
    }
    
    pesan += `\n📝 *INFO:*\n` +
            `Update data manual oleh SPV/PIC\n` +
            `Bot hanya untuk monitoring/view`;
    
    await kirimWhatsApp(pengirim, pesan);
}

async function kirimStatusKeseluruhan(pengirim, semuaData, prioritized) {
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    
    let pesan = `📊 *STATUS KESELURUHAN*\n` +
               `🕐 ${waktuSekarang}\n\n` +
               `Total Site: ${semuaData.length}\n\n`;
    
    pesan += `*PRIORITAS:*\n`;
    pesan += `🔴 PKS Lewat: ${prioritized.pksLewat.length}\n`;
    pesan += `🚨 PKS <7 Hari: ${prioritized.pksKritis.length}\n`;
    pesan += `⚠️ PKS 7-30 Hari: ${prioritized.pksMendekati.length}\n`;
    pesan += `📋 Belum BAK: ${prioritized.belumAdaBAK.length}\n\n`;
    
    if (prioritized.pksLewat.length > 0) {
        pesan += `*PKS LEWAT TERBARU:*\n`;
        prioritized.pksLewat.slice(0, 3).forEach((site, i) => {
            pesan += `${i+1}. ${site.siteId} - ${site.siteName}\n`;
            pesan += `   PIC: ${site.picLandlease}\n`;
            pesan += `   Lewat: ${hitungHariLewat(site.pksDateEnds)} hari\n\n`;
        });
    }
    
    if (prioritized.pksKritis.length > 0) {
        pesan += `*PKS KRITIS TERBARU:*\n`;
        prioritized.pksKritis.slice(0, 3).forEach((site, i) => {
            pesan += `${i+1}. ${site.siteId} - ${site.siteName}\n`;
            pesan += `   PIC: ${site.picLandlease}\n`;
            pesan += `   ${hitungHariMenuju(site.pksDateEnds)} hari lagi\n\n`;
        });
    }
    
    pesan += `📝 *INFO:*\n` +
            `• Data real-time dari Google Sheets\n` +
            `• Update manual oleh SPV/PIC\n` +
            `• Bot hanya untuk monitoring`;
    
    await kirimWhatsApp(pengirim, pesan);
}

async function kirimStatistikDetail(pengirim, semuaData) {
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    const prioritized = prioritaskanSite(semuaData);
    
    let pesan = `📊 *STATISTIK DETAIL*\n` +
               `🕐 ${waktuSekarang}\n\n`;
    
    // Hitung berdasarkan province
    const provinceCount = {};
    const picCount = {};
    const statusCount = {};
    
    semuaData.forEach(site => {
        // Province
        const province = site.province || 'Unknown';
        provinceCount[province] = (provinceCount[province] || 0) + 1;
        
        // PIC
        const pic = site.picLandlease || 'Unknown';
        picCount[pic] = (picCount[pic] || 0) + 1;
        
        // Status PKS
        const status = site.statusPKS || 'NY';
        statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    pesan += `*DISTRIBUSI PROVINCE:*\n`;
    for (const [province, count] of Object.entries(provinceCount)) {
        const percentage = ((count / semuaData.length) * 100).toFixed(1);
        pesan += `• ${province}: ${count} (${percentage}%)\n`;
    }
    
    pesan += `\n*DISTRIBUSI PIC:*\n`;
    for (const [pic, count] of Object.entries(picCount)) {
        const percentage = ((count / semuaData.length) * 100).toFixed(1);
        pesan += `• ${pic}: ${count} (${percentage}%)\n`;
    }
    
    pesan += `\n*STATUS PKS:*\n`;
    for (const [status, count] of Object.entries(statusCount)) {
        const percentage = ((count / semuaData.length) * 100).toFixed(1);
        pesan += `• ${status}: ${count} (${percentage}%)\n`;
    }
    
    // Hitung rata-rata hari menuju PKS
    let totalHariMenuju = 0;
    let countPks = 0;
    
    semuaData.forEach(site => {
        if (site.pksDateEnds && site.pksDateEnds !== 'Invalid Date') {
            const hariMenuju = hitungHariMenuju(site.pksDateEnds);
            totalHariMenuju += hariMenuju;
            countPks++;
        }
    });
    
    if (countPks > 0) {
        const rataRata = Math.floor(totalHariMenuju / countPks);
        pesan += `\n*RATA-RATA HARI MENUJU PKS:* ${rataRata} hari`;
    }
    
    pesan += `\n\n📝 *Total Site:* ${semuaData.length}`;
    
    await kirimWhatsApp(pengirim, pesan);
}

// =============================================
// FUNGSI PROFILE
// =============================================

async function handleProfile(pengirim) {
    const userInfo = getUserInfo(pengirim);
    const registeredDate = userInfo.registeredAt ? 
        new Date(userInfo.registeredAt).toLocaleDateString('id-ID') : 'Belum terdaftar';
    const subscribed = userInfo.subscribeReport ? '✅ Berlangganan' : '❌ Tidak berlangganan';
    
    const profile = `👤 *PROFILE ANDA*\n\n` +
        `Nama: ${userInfo.name}\n` +
        `Role: ${userInfo.role}\n` +
        `Terdaftar: ${registeredDate}\n` +
        `Report: ${subscribed}\n` +
        `Nomor: ${pengirim}\n\n` +
        `*FITUR YANG BISA DIGUNAKAN:*\n` +
        `• Melihat data BAK & PKS\n` +
        `• Monitoring status site\n` +
        `• Cek prioritas & reminder\n\n` +
        `*GANTI NAMA:*\n` +
        `Ketik: 13 [NAMA_BARU]\n` +
        `Contoh: 13 Ahmad Fauzi\n\n` +
        `*SUBSCRIBE/UNSUBSCRIBE:*\n` +
        `• 14 - Subscribe report harian\n` +
        `• 15 - Unsubscribe report\n\n` +
        `*CATATAN:*\n` +
        `Update data dilakukan manual oleh SPV/PIC`;
    
    await kirimWhatsApp(pengirim, profile);
}

async function handleGantiNama(pengirim, args) {
    if (args.length === 0) {
        await kirimWhatsApp(pengirim,
            `✏️ *GANTI NAMA*\n\n` +
            `Ketik: 13 [NAMA_BARU]\n` +
            `Contoh: 13 Ahmad Fauzi\n\n` +
            `Minimal 2 karakter.`
        );
        return;
    }
    
    const newName = args.join(' ').trim();
    if (newName.length < 2) {
        await kirimWhatsApp(pengirim, '❌ Nama terlalu pendek. Minimal 2 karakter.');
        return;
    }
    
    const oldName = getUserInfo(pengirim).name;
    userDatabase.set(pengirim, { 
        ...getUserInfo(pengirim),
        name: newName
    });
    
    await kirimWhatsApp(pengirim,
        `✅ *Nama berhasil diubah!*\n\n` +
        `Dari: ${oldName}\n` +
        `Menjadi: ${newName}\n\n` +
        `Ketik MENU untuk melanjutkan.`
    );
}

// =============================================
// FUNGSI INFO SISTEM
// =============================================
async function tampilkanInfoSistem(pengirim) {
    const semuaData = await bacaDataSpreadsheet();
    const prioritized = prioritaskanSite(semuaData);
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    const totalUsers = userDatabase.size;
    
    const info = `🤖 *INFORMASI SISTEM*\n` +
                `🕐 ${waktuSekarang}\n\n` +
                `*STATUS SISTEM:*\n` +
                `✅ WhatsApp Bot: Active\n` +
                `✅ Telegram Bot: Active\n` +
                `✅ Google Sheets: Connected\n\n` +
                `*DATA TERKINI:*\n` +
                `Total Site: ${semuaData.length}\n` +
                `🔴 PKS Lewat: ${prioritized.pksLewat.length}\n` +
                `🚨 PKS Kritis: ${prioritized.pksKritis.length}\n` +
                `⚠️  PKS Mendekati: ${prioritized.pksMendekati.length}\n` +
                `📋 Belum BAK: ${prioritized.belumAdaBAK.length}\n\n` +
                `*USER TERDAFTAR:* ${totalUsers}\n\n` +
                `*JADWAL REPORT OTOMATIS:*\n` +
                `🕗 Startup: Saat sistem hidup\n` +
                `🕗 Pagi: 08:00 WIB (Telegram)\n` +
                `🕗 Sore: 17:00 WIB (Telegram)\n` +
                `🕛 Tengah Hari: 12:00 WIB (Telegram)\n\n` +
                `*FITUR UTAMA:*\n` +
                `• View only monitoring\n` +
                `• Real-time data dari Google Sheets\n` +
                `• Prioritas otomatis\n` +
                `• Report harian otomatis\n\n` +
                `*CATATAN PENTING:*\n` +
                `Update data dilakukan manual oleh SPV/PIC\n` +
                `Bot hanya untuk monitoring/view saja`;
    
    await kirimWhatsApp(pengirim, info);
}

// =============================================
// FUNGSI HELP
// =============================================

async function tampilkanHelp(pengirim) {
    const help = `🤖 *PANDUAN BOT MONITORING*\n` +
        `*(VIEW ONLY - DATA SAJA)*\n\n` +
        `*FUNGSI BOT:*\n` +
        `• Melihat data BAK & PKS\n` +
        `• Monitoring status site\n` +
        `• Cek prioritas & reminder\n` +
        `• Summary & laporan\n` +
        `• Report otomatis (subscribe)\n\n` +
        `*YANG TIDAK BISA:*\n` +
        `✗ Update data (manual oleh SPV/PIC)\n` +
        `✗ Edit tanggal\n` +
        `✗ Ubah status\n\n` +
        `*MENU UTAMA (1-19):*\n` +
        `1-7: Laporan & Monitoring\n` +
        `8-11: Summary & Statistik\n` +
        `12-15: Profile & Setting\n` +
        `16-19: Bantuan & Info\n\n` +
        `*CONTOH PERINTAH:*\n` +
        `• "1" - Laporan semua site\n` +
        `• "2 A" - Laporan PIC Afrizal\n` +
        `• "3 SITE123" - Cari site spesifik\n` +
        `• "14" - Subscribe report harian\n` +
        `• "19" - Cek waktu server\n\n` +
        `*PERINTAH CEPAT:*\n` +
        `• MENU - Tampilkan menu\n` +
        `• HELP - Panduan ini\n` +
        `• LIST - Daftar site\n` +
        `• STATUS - Status keseluruhan\n` +
        `• TIME - Cek waktu server\n\n` +
        `*REGISTRASI:*\n` +
        `Ketik: REGISTER [NAMA]\n` +
        `Contoh: REGISTER Afrizal\n\n` +
        `*REPORT OTOMATIS:*\n` +
        `• Telegram: PIC/Management (otomatis)\n` +
        `• WhatsApp: User (subscribe dulu)\n` +
        `• Jadwal: 08:00, 12:00, 17:00 WIB\n\n` +
        `*CATATAN PENTING:*\n` +
        `Update data dilakukan manual oleh SPV/PIC masing-masing!\n` +
        `Bot hanya untuk monitoring/view saja.`;
    
    await kirimWhatsApp(pengirim, help);
}

// =============================================
// FUNGSI LAINNYA (TIDAK BERUBAH)
// =============================================

async function notifyAdmin(pesan) {
    try {
        // Kirim ke Telegram admin (SPV dan RM)
        for (const [key, pic] of Object.entries(CONFIG.PICS)) {
            if (pic.type === 'MANAGEMENT' && pic.tele) {
                await teleBot.sendMessage(pic.tele, `📱 ${pesan}`);
                await delay(500);
            }
        }
    } catch (error) {
        console.error('❌ Gagal kirim notifikasi admin:', error);
    }
}

async function bacaDataSpreadsheet() {
    try {
        console.log('📊 Membaca data dari Google Spreadsheet...');
        
        const serviceAccountAuth = new JWT({
            email: SERVICE_ACCOUNT_EMAIL,
            key: PRIVATE_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
        
        await doc.loadInfo();
        console.log(`✅ Berhasil konek ke: ${doc.title}`);
        
        const sheet = doc.sheetsByIndex[0];
        console.log(`📋 Sheet: ${sheet.title}`);
        
        const rows = await sheet.getRows();
        console.log(`📝 Jumlah rows: ${rows.length}`);
        
        if (rows.length === 0) {
            console.log('⚠️  Tidak ada data rows');
            return [];
        }

        const data = rows.map((row, index) => {
            try {
                const siteId = row.get('Site ID') || row['Site ID'] || (row._rawData && row._rawData[0]) || 'NO ID';
                const siteName = row.get('Site Name') || row['Site Name'] || (row._rawData && row._rawData[1]) || 'NO NAME';
                const picLandlease = row.get('PIC Landlease') || row['PIC Landlease'] || (row._rawData && row._rawData[8]) || '';
                const tanggalBAK = row.get('Tanggal BAK') || row['Tanggal BAK'] || (row._rawData && row._rawData[9]) || '';
                const pksDateEnds = row.get('PKS Date Ends') || row['PKS Date Ends'] || (row._rawData && row._rawData[13]) || '';
                const statusBAK = row.get('Status BAK') || row['Status BAK'] || (row._rawData && row._rawData[10]) || 'NY';
                const statusPKS = row.get('STATUS PKS') || row['STATUS PKS'] || (row._rawData && row._rawData[12]) || 'NY';
                const province = row.get('Province') || row['Province'] || (row._rawData && row._rawData[2]) || '-';
                const progressPembayaran = row.get('Progess Pembayaran') || row['Progess Pembayaran'] || (row._rawData && row._rawData[11]) || '-';
                const detailKekuranganDokumen = row.get('Detail Kekurangan Dokumen') || row['Detail Kekurangan Dokumen'] || (row._rawData && row._rawData[12]) || '-';

                let normalizedPic = picLandlease;
                if (normalizedPic === 'Lingga Baidilah') {
                    normalizedPic = 'Lingga Baidillah';
                }

                const siteData = {
                    siteId: siteId,
                    siteName: siteName, 
                    province: province,
                    picLandlease: normalizedPic,
                    tanggalBAK: parseTanggal(tanggalBAK),
                    statusBAK: statusBAK,
                    pksDateEnds: parseTanggal(pksDateEnds),
                    statusPKS: statusPKS,
                    progressPembayaran: progressPembayaran,
                    detailKekuranganDokumen: detailKekuranganDokumen
                };

                return siteData;
            } catch (error) {
                console.error(`❌ Error parsing row ${index}:`, error);
                return null;
            }
        }).filter(site => site !== null && site.siteId && site.siteId !== 'NO ID' && site.siteId !== '');
        
        console.log(`✅ Berhasil baca ${data.length} data site yang valid`);
        return data;
    } catch (error) {
        console.error('❌ Gagal baca spreadsheet:', error.message);
        return [];
    }
}

function prioritaskanSite(sites) {
    const pksLewat = [];
    const pksKritis = [];
    const pksMendekati = [];
    const pks3Bulan = [];
    const belumAdaBAK = [];
    const lainnya = [];
    
    sites.forEach(site => {
        if (!site.pksDateEnds || site.pksDateEnds === 'Invalid Date') {
            const noTanggalBAK = !site.tanggalBAK || site.tanggalBAK === 'Invalid Date' || site.tanggalBAK.toString().trim() === '';
            const statusNY = site.statusBAK === 'NY' || !site.statusBAK || site.statusBAK.includes('NY');
            
            if (noTanggalBAK && statusNY) {
                belumAdaBAK.push(site);
            } else {
                lainnya.push(site);
            }
            return;
        }
        
        const hariMenuju = hitungHariMenuju(site.pksDateEnds);
        const hariLewat = hitungHariLewat(site.pksDateEnds);
        
        if (hariLewat > 0) {
            pksLewat.push({
                ...site,
                hariLewat: hariLewat,
                priority: 1
            });
        } else if (hariMenuju <= 7) {
            pksKritis.push({
                ...site,
                hariMenuju: hariMenuju,
                priority: 2
            });
        } else if (hariMenuju <= 30) {
            pksMendekati.push({
                ...site,
                hariMenuju: hariMenuju,
                priority: 3
            });
        } else if (hariMenuju <= CONFIG.PKS_3_BULAN) {
            pks3Bulan.push({
                ...site,
                hariMenuju: hariMenuju,
                priority: 4
            });
        } else {
            lainnya.push(site);
        }
    });
    
    pksLewat.sort((a, b) => b.hariLewat - a.hariLewat);
    pksKritis.sort((a, b) => a.hariMenuju - b.hariMenuju);
    pksMendekati.sort((a, b) => a.hariMenuju - b.hariMenuju);
    pks3Bulan.sort((a, b) => a.hariMenuju - b.hariMenuju);
    
    return {
        pksLewat,
        pksKritis, 
        pksMendekati,
        pks3Bulan,
        belumAdaBAK,
        lainnya
    };
}

// =============================================
// FUNGSI REPORT OTOMATIS (TELEGRAM & WHATSAPP)
// =============================================

async function kirimLaporanPrioritasTelegram() {
    try {
        console.log('🕗 Mengirim laporan harian dengan prioritas ke Telegram...');
        const semuaData = await bacaDataSpreadsheet();
        
        if (semuaData.length === 0) {
            console.log('⚠️  Tidak ada data, skip kirim laporan harian');
            return;
        }
        
        // Kirim ke setiap PIC dan MANAGEMENT via Telegram
        for (const [key, pic] of Object.entries(CONFIG.PICS)) {
            let sitesUntukPIC = [];
            
            if (pic.type === 'PIC') {
                sitesUntukPIC = semuaData.filter(site => site.picLandlease === pic.name);
            } else if (pic.type === 'MANAGEMENT') {
                sitesUntukPIC = semuaData.filter(site => 
                    site.picLandlease === 'Afrizal' || 
                    site.picLandlease === 'Donny Yulianto' || 
                    site.picLandlease === 'Lingga Baidillah'
                );
            }
            
            if (sitesUntukPIC.length === 0) {
                console.log(`⏭️  Skip ${pic.name} - tidak ada data`);
                continue;
            }
            
            const pesanTelegram = generateLaporanPrioritas(pic.name, sitesUntukPIC, pic.type);
            
            // Kirim Telegram (UNTUK REMINDER)
            if (pic.tele) {
                try {
                    await teleBot.sendMessage(pic.tele, pesanTelegram.replace(/\*/g, '*'));
                    console.log(`✅ Telegram reminder terkirim ke ${pic.name}`);
                    await delay(1500);
                } catch (error) {
                    console.error(`❌ Gagal kirim Telegram ke ${pic.name}:`, error.message);
                }
            }
        }
        
        console.log('✅ Semua laporan prioritas terkirim ke Telegram!');
        
    } catch (error) {
        console.error('❌ Gagal kirim laporan prioritas:', error);
    }
}

function generateLaporanPrioritas(picName, sites, picType = 'PIC') {
    const sekarang = getWaktuIndonesia();
    const formattedDate = sekarang.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
    });
    
    const prioritized = prioritaskanSite(sites);
    
    let pesan = `📊 *REMINDER HARIAN - ${picName}* 📊\n`;
    pesan += `Tanggal: ${formattedDate}\n`;
    pesan += `Waktu: ${sekarang.getHours().toString().padStart(2, '0')}:${sekarang.getMinutes().toString().padStart(2, '0')} WIB\n`;
    pesan += `Tipe: ${picType === 'MANAGEMENT' ? 'MANAJEMEN (ALL SITES)' : 'PIC'}\n\n`;
    
    // SECTION 1: PKS SUDAH LEWAT
    if (prioritized.pksLewat.length > 0) {
        const displayLewat = prioritized.pksLewat.slice(0, 10);
        pesan += `🔴 *PKS SUDAH LEWAT (${prioritized.pksLewat.length} site):*\n`;
        
        displayLewat.forEach((site, i) => {
            const hariLewat = hitungHariLewat(site.pksDateEnds);
            pesan += `${i+1}. *${site.siteName}*\n`;
            pesan += `   📍 ${site.siteId} | 👤 ${site.picLandlease}\n`;
            pesan += `   📅 PKS Ends: ${formatTanggal(site.pksDateEnds)}\n`;
            pesan += `   ⏰ LEWAT: ${hariLewat} HARI\n`;
            pesan += `   📋 Status: ${site.statusPKS || 'NY'}\n\n`;
        });
        
        if (prioritized.pksLewat.length > 10) {
            pesan += `... dan ${prioritized.pksLewat.length - 10} site lainnya\n\n`;
        }
    }
    
    // SECTION 2: PKS KRITIS (<7 HARI)
    if (prioritized.pksKritis.length > 0) {
        const displayKritis = prioritized.pksKritis.slice(0, 8);
        pesan += `🚨 *PKS KRITIS (<7 HARI) (${prioritized.pksKritis.length} site):*\n`;
        
        displayKritis.forEach((site, i) => {
            const hariMenuju = hitungHariMenuju(site.pksDateEnds);
            pesan += `${i+1}. *${site.siteName}*\n`;
            pesan += `   📍 ${site.siteId} | 👤 ${site.picLandlease}\n`;
            pesan += `   📅 PKS Ends: ${formatTanggal(site.pksDateEnds)}\n`;
            pesan += `   ⏰ ${hariMenuju} HARI LAGI\n`;
            pesan += `   📋 Status: ${site.statusPKS || 'NY'}\n\n`;
        });
        
        if (prioritized.pksKritis.length > 8) {
            pesan += `... dan ${prioritized.pksKritis.length - 8} site lainnya\n\n`;
        }
    }
    
    // SUMMARY TOTAL
    const totalPrioritas = prioritized.pksLewat.length + prioritized.pksKritis.length + 
                          prioritized.pksMendekati.length + prioritized.pks3Bulan.length;
    
    if (totalPrioritas === 0 && prioritized.belumAdaBAK.length === 0) {
        pesan += `✅ Tidak ada reminder prioritas untuk hari ini.\n\n`;
    } else {
        pesan += `📈 *SUMMARY PRIORITAS:*\n`;
        pesan += `🔴 PKS Lewat: ${prioritized.pksLewat.length} site\n`;
        pesan += `🚨 PKS Kritis: ${prioritized.pksKritis.length} site\n`;
        pesan += `⚠️  PKS Mendekati: ${prioritized.pksMendekati.length} site\n`;
        pesan += `📅 PKS 3 Bulan: ${prioritized.pks3Bulan.length} site\n`;
        pesan += `📋 Belum BAK: ${prioritized.belumAdaBAK.length} site\n`;
        pesan += `📊 Total Site: ${sites.length} site\n\n`;
    }
    
    // REKOMENDASI AKSI
    if (prioritized.pksLewat.length > 0) {
        pesan += `💡 *REKOMENDASI:*\n`;
        pesan += `• FOKUS pada ${prioritized.pksLewat.length} site PKS LEWAT\n`;
        pesan += `• Segera perpanjang PKS yang sudah lewat\n`;
    }
    
    pesan += `\n📱 *Untuk monitoring data, gunakan WhatsApp Bot*\n`;
    pesan += `📝 *Update data: Manual oleh SPV/PIC masing-masing*`;
    
    return pesan;
}

async function kirimLaporanSoreTelegram() {
    try {
        console.log('🌆 Mengirim laporan sore ke Telegram...');
        const semuaData = await bacaDataSpreadsheet();
        
        if (semuaData.length === 0) return;
        
        const sekarang = getWaktuIndonesia();
        const formattedTime = `${sekarang.getHours().toString().padStart(2, '0')}:${sekarang.getMinutes().toString().padStart(2, '0')} WIB`;
        
        const prioritized = prioritaskanSite(semuaData);
        
        for (const [key, pic] of Object.entries(CONFIG.PICS)) {
            if (pic.tele) {
                let pesan = `🌆 *LAPORAN SORE - ${pic.name}*\n`;
                pesan += `Waktu: ${formattedTime}\n\n`;
                
                // Kirim summary singkat
                if (prioritized.pksLewat.length > 0) {
                    pesan += `🔴 *PKS LEWAT:* ${prioritized.pksLewat.length} site\n`;
                }
                if (prioritized.pksKritis.length > 0) {
                    pesan += `🚨 *PKS KRITIS:* ${prioritized.pksKritis.length} site\n`;
                }
                if (prioritized.belumAdaBAK.length > 0) {
                    pesan += `📋 *BELUM BAK:* ${prioritized.belumAdaBAK.length} site\n`;
                }
                
                pesan += `\n📊 Total Site: ${semuaData.length}\n`;
                pesan += `📝 Update data: Manual oleh SPV/PIC\n\n`;
                pesan += `_Semangat menyelesaikan hari!_ 💪`;
                
                await teleBot.sendMessage(pic.tele, pesan.replace(/\*/g, '*'));
                await delay(1000);
            }
        }
        
    } catch (error) {
        console.error('❌ Gagal kirim laporan sore:', error);
    }
}

async function kirimReminderTengahHari() {
    try {
        console.log('🕛 Mengirim reminder tengah hari ke Telegram...');
        const semuaData = await bacaDataSpreadsheet();
        
        if (semuaData.length === 0) return;
        
        const prioritized = prioritaskanSite(semuaData);
        
        // Hanya kirim ke PIC, bukan management
        for (const [key, pic] of Object.entries(CONFIG.PICS)) {
            if (pic.type === 'PIC' && pic.tele) {
                const sitesPic = semuaData.filter(site => site.picLandlease === pic.name);
                const prioritizedPic = prioritaskanSite(sitesPic);
                
                if (prioritizedPic.pksLewat.length > 0 || prioritizedPic.pksKritis.length > 0) {
                    let pesan = `⏰ *REMINDER TENGAH HARI - ${pic.name}*\n\n`;
                    
                    if (prioritizedPic.pksLewat.length > 0) {
                        pesan += `🔴 *PKS LEWAT:* ${prioritizedPic.pksLewat.length} site\n`;
                        prioritizedPic.pksLewat.slice(0, 3).forEach(site => {
                            pesan += `• ${site.siteName} (${site.siteId})\n`;
                        });
                        pesan += `\n`;
                    }
                    
                    if (prioritizedPic.pksKritis.length > 0) {
                        pesan += `🚨 *PKS KRITIS:* ${prioritizedPic.pksKritis.length} site\n`;
                        prioritizedPic.pksKritis.slice(0, 3).forEach(site => {
                            pesan += `• ${site.siteName} (${site.siteId})\n`;
                        });
                    }
                    
                    pesan += `\n💡 *FOKUSKAN* pada site prioritas di atas!\n`;
                    pesan += `📱 Gunakan WhatsApp bot untuk detail`;
                    
                    await teleBot.sendMessage(pic.tele, pesan.replace(/\*/g, '*'));
                    await delay(1000);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Gagal kirim reminder tengah hari:', error);
    }
}

// =============================================
// FUNGSI BROADCAST WHATSAPP (UNTUK SUBSCRIBER)
// =============================================

async function broadcastReportHarianWhatsApp(jenis = 'PAGI') {
    try {
        console.log(`📱 Broadcast report ${jenis} ke WhatsApp subscribers...`);
        
        const semuaData = await bacaDataSpreadsheet();
        
        if (semuaData.length === 0) {
            console.log('⚠️  Tidak ada data, skip broadcast');
            return;
        }
        
        // Ambil semua user yang subscribe
        const subscribers = Array.from(userDatabase.entries())
            .filter(([_, info]) => info.subscribeReport === true);
        
        if (subscribers.length === 0) {
            console.log('⚠️  Tidak ada subscriber, skip broadcast');
            return;
        }
        
        const prioritized = prioritaskanSite(semuaData);
        const sekarang = getWaktuIndonesia();
        const formattedTime = `${sekarang.getHours().toString().padStart(2, '0')}:${sekarang.getMinutes().toString().padStart(2, '0')} WIB`;
        
        console.log(`📤 Mengirim report ${jenis} ke ${subscribers.length} subscriber...`);
        
        // Broadcast ke setiap subscriber
        for (const [user, info] of subscribers) {
            try {
                let pesan = '';
                
                switch(jenis) {
                    case 'PAGI':
                        pesan = `🌅 *REPORT PAGI - ${info.name}*\n` +
                               `🕐 ${formattedTime}\n\n` +
                               `Total Site: ${semuaData.length}\n` +
                               `🔴 PKS Lewat: ${prioritized.pksLewat.length}\n` +
                               `🚨 PKS Kritis: ${prioritized.pksKritis.length}\n` +
                               `⚠️  PKS Mendekati: ${prioritized.pksMendekati.length}\n\n` +
                               `💡 *FOKUS HARI INI:*\n`;
                        
                        if (prioritized.pksLewat.length > 0) {
                            pesan += `• ${prioritized.pksLewat.length} site PKS LEWAT\n`;
                        }
                        if (prioritized.pksKritis.length > 0) {
                            pesan += `• ${prioritized.pksKritis.length} site PKS KRITIS\n`;
                        }
                        
                        pesan += `\n📱 Ketik MENU untuk detail\n` +
                                `📝 Update: Manual oleh SPV/PIC\n\n` +
                                `_Semangat bekerja!_ 💪`;
                        break;
                        
                    case 'SORE':
                        pesan = `🌇 *REPORT SORE - ${info.name}*\n` +
                               `🕐 ${formattedTime}\n\n` +
                               `📊 *HASIL HARI INI:*\n` +
                               `Total Site: ${semuaData.length}\n`;
                        
                        if (prioritized.pksLewat.length > 0) {
                            pesan += `🔴 PKS Lewat: ${prioritized.pksLewat.length}\n`;
                        }
                        if (prioritized.pksKritis.length > 0) {
                            pesan += `🚨 PKS Kritis: ${prioritized.pksKritis.length}\n`;
                        }
                        if (prioritized.belumAdaBAK.length > 0) {
                            pesan += `📋 Belum BAK: ${prioritized.belumAdaBAK.length}\n`;
                        }
                        
                        pesan += `\n📝 *CATATAN:*\n` +
                                `• Update data manual oleh SPV/PIC\n` +
                                `• Bot hanya untuk monitoring\n\n` +
                                `_Istirahat yang cukup!_ 😊`;
                        break;
                }
                
                await kirimWhatsApp(user, pesan);
                console.log(`✅ Report ${jenis} terkirim ke ${info.name}`);
                
                // Delay untuk hindari limit WhatsApp
                await delay(3000); // 3 detik antar pesan
                
            } catch (error) {
                console.error(`❌ Gagal broadcast ke ${user}:`, error.message);
            }
        }
        
        console.log(`✅ Broadcast report ${jenis} WhatsApp selesai!`);
        
    } catch (error) {
        console.error(`❌ Error broadcast report ${jenis} WhatsApp:`, error);
    }
}

// =============================================
// FUNGSI REPORT STARTUP
// =============================================

async function kirimReportStartup() {
    try {
        console.log('🚀 Mengirim report startup ke Telegram...');
        const semuaData = await bacaDataSpreadsheet();
        
        if (semuaData.length === 0) {
            console.log('⚠️  Tidak ada data, skip kirim report startup');
            return;
        }
        
        const sekarang = getWaktuIndonesia();
        const formattedTime = `${sekarang.toLocaleDateString('id-ID')} ${sekarang.getHours().toString().padStart(2, '0')}:${sekarang.getMinutes().toString().padStart(2, '0')} WIB`;
        
        const prioritized = prioritaskanSite(semuaData);
        
        // Kirim ke semua PIC dan MANAGEMENT via Telegram
        for (const [key, pic] of Object.entries(CONFIG.PICS)) {
            let sitesUntukPIC = [];
            
            if (pic.type === 'PIC') {
                sitesUntukPIC = semuaData.filter(site => site.picLandlease === pic.name);
            } else if (pic.type === 'MANAGEMENT') {
                sitesUntukPIC = semuaData.filter(site => 
                    site.picLandlease === 'Afrizal' || 
                    site.picLandlease === 'Donny Yulianto' || 
                    site.picLandlease === 'Lingga Baidillah'
                );
            }
            
            if (sitesUntukPIC.length === 0) {
                console.log(`⏭️  Skip ${pic.name} - tidak ada data`);
                continue;
            }
            
            const prioritizedPIC = prioritaskanSite(sitesUntukPIC);
            
            let pesan = `🚀 *SISTEM STARTUP - ${pic.name}* 🚀\n`;
            pesan += `Waktu: ${formattedTime}\n`;
            pesan += `Status: Sistem baru dihidupkan\n\n`;
            
            // Total data
            pesan += `📊 *DATA TERBARU:*\n`;
            pesan += `Total Site: ${sitesUntukPIC.length}\n`;
            pesan += `🔴 PKS Lewat: ${prioritizedPIC.pksLewat.length}\n`;
            pesan += `🚨 PKS Kritis: ${prioritizedPIC.pksKritis.length}\n`;
            pesan += `⚠️  PKS Mendekati: ${prioritizedPIC.pksMendekati.length}\n`;
            pesan += `📅 PKS 3 Bulan: ${prioritizedPIC.pks3Bulan.length}\n`;
            pesan += `📋 Belum BAK: ${prioritizedPIC.belumAdaBAK.length}\n\n`;
            
            // Kirim ke Telegram
            if (pic.tele) {
                try {
                    await teleBot.sendMessage(pic.tele, pesan.replace(/\*/g, '*'));
                    console.log(`✅ Report startup terkirim ke ${pic.name}`);
                    await delay(1500);
                } catch (error) {
                    console.error(`❌ Gagal kirim startup report ke ${pic.name}:`, error.message);
                }
            }
        }
        
        console.log('✅ Semua report startup terkirim ke Telegram!');
        
    } catch (error) {
        console.error('❌ Gagal kirim report startup:', error);
    }
}

// =============================================
// SETUP JADWAL DENGAN TIMEZONE INDONESIA
// =============================================

function setupJadwal() {
    console.log('⏰ Setting up cron schedule dengan timezone Asia/Jakarta (WIB)');
    
    // 1. Laporan harian jam 08:00 WIB (Telegram)
    cron.schedule('0 8 * * *', async () => {
        const now = getWaktuIndonesia();
        console.log(`⏰ [${formatWaktu(now, true)}] Kirim laporan harian ke Telegram`);
        await kirimLaporanPrioritasTelegram();
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });
    
    // 2. Reminder tengah hari jam 12:00 WIB (Telegram)
    cron.schedule('0 12 * * *', async () => {
        const now = getWaktuIndonesia();
        console.log(`⏰ [${formatWaktu(now, true)}] Kirim reminder tengah hari`);
        await kirimReminderTengahHari();
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });
    
    // 3. Laporan sore jam 17:00 WIB (Telegram)
    cron.schedule('0 17 * * *', async () => {
        const now = getWaktuIndonesia();
        console.log(`⏰ [${formatWaktu(now, true)}] Kirim laporan sore`);
        await kirimLaporanSoreTelegram();
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });
    
    // 4. Report pagi jam 08:30 WIB (WhatsApp untuk subscriber)
    cron.schedule('30 8 * * *', async () => {
        const now = getWaktuIndonesia();
        console.log(`⏰ [${formatWaktu(now, true)}] Broadcast report pagi ke WhatsApp`);
        await broadcastReportHarianWhatsApp('PAGI');
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });
    
    // 5. Report sore jam 17:30 WIB (WhatsApp untuk subscriber)
    cron.schedule('30 17 * * *', async () => {
        const now = getWaktuIndonesia();
        console.log(`⏰ [${formatWaktu(now, true)}] Broadcast report sore ke WhatsApp`);
        await broadcastReportHarianWhatsApp('SORE');
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });
    
    console.log('✅ Jadwal cron aktif dengan timezone Asia/Jakarta (WIB)');
    console.log('• Telegram Report: 08:00, 12:00, 17:00 WIB');
    console.log('• WhatsApp Report (subscriber): 08:30, 17:30 WIB');
    console.log('• WIB = UTC+7 (Indonesia Western Time)');
}

// =============================================
// EVENT HANDLER WHATSAPP
// =============================================
whatsappClient.on('qr', (qr) => {
    console.log('📱 Scan QR Code untuk WhatsApp:');
    qrcode.generate(qr, { small: true });
});

whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp bot ready!');
    console.log('🤖 WhatsApp bot MODE: VIEW ONLY');
    console.log('📱 Fitur: Monitoring data saja (tidak ada update)');
    console.log('⏰ Timezone: WIB (UTC+7)');
});

whatsappClient.on('message', async (message) => {
    try {
        // Abaikan pesan dari status broadcast
        if (message.from === 'status@broadcast') return;
        
        // Proses pesan
        await prosesPesanWhatsApp(message.from, message.body);
        
    } catch (error) {
        console.error('❌ Error handling WhatsApp message:', error);
    }
});

// =============================================
// JALANKAN APLIKASI
// =============================================
async function startApp() {
    try {
        console.log('🚀 Starting Monitoring System...');
        console.log('📊 Google Sheet ID:', SPREADSHEET_ID);
        console.log('🤖 Total PIC:', Object.keys(CONFIG.PICS).length);
        console.log('📱 WhatsApp Bot: ✅ Ready (VIEW ONLY)');
        console.log('📨 Telegram Reminder: ✅ Ready');
        
        // Cek waktu server
        const serverTime = new Date();
        const wibTime = getWaktuIndonesia();
        console.log('🕐 Server Time:', serverTime.toLocaleString('id-ID'));
        console.log('🕐 WIB Time (UTC+7):', formatWaktu(wibTime, true));
        
        // Start WhatsApp bot
        console.log('📱 Starting WhatsApp monitoring bot...');
        await whatsappClient.initialize();
        
        // Setup jadwal untuk reminder otomatis ke Telegram
        setupJadwal();
        
        // 🔥 Kirim report saat sistem pertama hidup
        console.log('📤 Mengirim report startup ke Telegram...');
        await kirimReportStartup();
        
        // Kirim pesan ready
        console.log('📤 Mengirim notifikasi sistem ready...');
        await kirimPesanReady();
        
        console.log('✅ Sistem berhasil dijalankan!');
        console.log('\n=== SISTEM SEDANG BERJALAN ===');
        console.log('• WhatsApp: Monitoring/view only');
        console.log('• Telegram: Otomatis reminder harian ke PIC');
        console.log('• Timezone: WIB (UTC+7)');
        console.log('• Update: Manual oleh SPV/PIC masing-masing');
        console.log('• Report Otomatis: 08:00, 12:00, 17:00 WIB');
        
    } catch (error) {
        console.error('❌ Gagal start aplikasi:', error);
        process.exit(1);
    }
}

function generatePesanReady() {
    const sekarang = getWaktuIndonesia();
    const waktu = `${sekarang.getHours().toString().padStart(2, '0')}:${sekarang.getMinutes().toString().padStart(2, '0')} WIB`;
    
    return `🤖 *SISTEM MONITORING BAK & PKS READY* 🤖
Waktu: ${waktu}

Sistem monitoring telah aktif dengan fitur:

📱 *WHATSAPP BOT (VIEW ONLY):*
• Chat saja untuk memulai
• Menu: Laporan, Cek Status, Summary
• Hanya untuk melihat/monitoring data
• Tidak ada fitur update
• Subscribe report harian (opsional)

📨 *TELEGRAM (Reminder Only):*
• Otomatis kirim reminder: 08:00, 12:00, 17:00 WIB
• Prioritas: PKS Lewat, PKS Kritis, dll
• Tidak perlu reply, hanya notifikasi

📝 *CATATAN PENTING:*
• Update data dilakukan MANUAL oleh SPV/PIC
• WhatsApp bot hanya untuk monitoring
• Data real-time dari Google Sheets
• Timezone: WIB (UTC+7)

_Semangat bekerja! 💪_`;
}

async function kirimPesanReady() {
    const pesan = generatePesanReady();
    
    console.log('🤖 Mengirim pesan sistem ready...');
    
    // Kirim ke Telegram semua PIC dan Management
    for (const [key, pic] of Object.entries(CONFIG.PICS)) {
        if (pic.tele) {
            try {
                await teleBot.sendMessage(pic.tele, pesan.replace(/\*/g, '*'));
                console.log(`✅ Ready message Telegram ke ${pic.name}`);
                await delay(1000);
            } catch (error) {
                console.error(`❌ Gagal kirim Telegram ke ${pic.name}:`, error.message);
            }
        }
    }
}

// =============================================
// COMMAND TELEGRAM
// =============================================
teleBot.on('polling_error', (error) => {
    console.error('❌ Telegram polling error:', error);
});

teleBot.on('message', (msg) => {
    if (msg.text === '/id') {
        teleBot.sendMessage(msg.chat.id, 
            `🤖 INFO CHAT ID:\n` +
            `Chat ID: ${msg.chat.id}\n` +
            `Nama: ${msg.chat.first_name} ${msg.chat.last_name || ''}\n` +
            `Type: ${msg.chat.type}\n\n` +
            `Simpan di file .env!`
        );
    }
});

teleBot.onText(/\/reportnow/, async (msg) => {
    console.log('🔄 Manual trigger kirim report prioritas...');
    
    try {
        teleBot.sendMessage(msg.chat.id, '⏳ Mengambil data terbaru dan mengirim report prioritas...');
        await kirimLaporanPrioritasTelegram();
        teleBot.sendMessage(msg.chat.id, '✅ Report prioritas harian terkirim!');
    } catch (error) {
        console.error('❌ Gagal kirim report:', error);
        teleBot.sendMessage(msg.chat.id, '❌ Gagal mengirim report, cek log sistem');
    }
});

teleBot.onText(/\/status/, async (msg) => {
    const semuaData = await bacaDataSpreadsheet();
    const totalSites = semuaData.length;
    
    const prioritized = prioritaskanSite(semuaData);
    const waktuSekarang = formatWaktu(getWaktuIndonesia(), true);
    
    teleBot.sendMessage(msg.chat.id, 
        `🤖 STATUS SISTEM:\n` +
        `Waktu: ${waktuSekarang}\n` +
        `Telegram Reminder: ✅ Ready\n` +
        `WhatsApp Monitoring: ${whatsappClient.info ? '✅ Connected' : '❌ Not Connected'}\n` +
        `Google Sheets: ${semuaData.length > 0 ? '✅ Connected' : '❌ Error'}\n` +
        `Total Sites: ${totalSites}\n` +
        `🔴 PKS Lewat: ${prioritized.pksLewat.length}\n` +
        `🚨 PKS Kritis: ${prioritized.pksKritis.length}\n` +
        `⚠️  PKS Mendekati: ${prioritized.pksMendekati.length}\n` +
        `📅 PKS 3 Bulan: ${prioritized.pks3Bulan.length}\n` +
        `📋 Belum BAK: ${prioritized.belumAdaBAK.length}\n\n` +
        `📱 *WhatsApp Bot: VIEW ONLY (tidak ada update)*\n` +
        `📝 *Update: Manual oleh SPV/PIC*\n` +
        `⏰ *Timezone: WIB (UTC+7)*`
    );
});

// Handle shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    whatsappClient.destroy();
    process.exit(0);
});

// Jalankan aplikasi
startApp();