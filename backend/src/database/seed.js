import { db, initDb, dbRun, dbQuery } from '../config/db.js';

// Computer Science & Engineering Students (88)
const cistCseStudents = [
  { pin: '23S01A0501', name: 'BANDHILI DEEPIKA' },
  { pin: '23S01A0502', name: 'BEDHAMPUDI DEVIKA' },
  { pin: '23S01A0503', name: 'BEERA SUREKHA' },
  { pin: '23S01A0504', name: 'BODAKURTHI PARVATHI' },
  { pin: '23S01A0505', name: 'BODAPATI SUVARNA' },
  { pin: '23S01A0506', name: 'BOJJAPU ASWINI' },
  { pin: '23S01A0507', name: 'BOLISETTI DURGA BHAVANI' },
  { pin: '23S01A0508', name: 'BONASU GOVINDU' },
  { pin: '23S01A0509', name: 'BONDI SURYA TEJAS' },
  { pin: '23S01A0510', name: 'CHALLA SANTHI KUMARI' },
  { pin: '23S01A0511', name: 'CHINTA LAKSHMI' },
  { pin: '23S01A0513', name: 'CHITRAPU SAHITHI' },
  { pin: '23S01A0514', name: 'DANIMIREDDI MEGHANA' },
  { pin: '23S01A0515', name: 'DONDAPATI PRAMEELA' },
  { pin: '23S01A0516', name: 'DUVVU SAIMANOHAR' },
  { pin: '23S01A0517', name: 'GADUGOILA UMA MAHESHWARA RAO' },
  { pin: '23S01A0518', name: 'GANTI VINYA SRI' },
  { pin: '23S01A0519', name: 'GEDDAM HARIKA' },
  { pin: '23S01A0520', name: 'GEDDAM SUMANTH' },
  { pin: '23S01A0521', name: 'GEDDAM SWATHI' },
  { pin: '23S01A0522', name: 'GOLLA LITTLE KANTHA SRI' },
  { pin: '23S01A0523', name: 'GOLLEPALLI NAGESWARI' },
  { pin: '23S01A0524', name: 'GONELA TEJA SRI' },
  { pin: '23S01A0525', name: 'GONNURI NAVYASRI' },
  { pin: '23S01A0526', name: 'KAKI LAVANYA' },
  { pin: '23S01A0527', name: 'KAMIDI DURGABHAVANI' },
  { pin: '23S01A0528', name: 'KANCHUMARTHI BLESSY PRAVEENA' },
  { pin: '23S01A0529', name: 'KATTUMURI MANIDEEP' },
  { pin: '23S01A0530', name: 'KEERTHI MOUNIKA' },
  { pin: '23S01A0531', name: 'KODAVATI SHARUNI RANI' },
  { pin: '23S01A0532', name: 'KOMARTHA NAVYA' },
  { pin: '23S01A0533', name: 'KOPPULA GOWTHAM KUMAR' },
  { pin: '23S01A0534', name: 'KUDUPUDI TEJASWANI' },
  { pin: '23S01A0535', name: 'KUVVALA RAJU' },
  { pin: '23S01A0536', name: 'LANKA DIVYA' },
  { pin: '23S01A0537', name: 'MADIKI NAVYA' },
  { pin: '23S01A0538', name: 'MAMIIDI RAMA LAKSHMI' },
  { pin: '23S01A0539', name: 'MUDUNURI LEELA SATYA VENKATA' },
  { pin: '23S01A0540', name: 'MUPPIDI MADHURI' },
  { pin: '23S01A0541', name: 'MURAMALLA NIDHARSHINI' },
  { pin: '23S01A0543', name: 'NETHALA CHANDINI' },
  { pin: '23S01A0544', name: 'NETHALA SESHA RATHNAM' },
  { pin: '23S01A0545', name: 'OLETI SYAMALA' },
  { pin: '23S01A0546', name: 'PALEPU DHANA KUMARI' },
  { pin: '23S01A0547', name: 'PALIVELA VIJAYA' },
  { pin: '23S01A0548', name: 'PALLA TEJASWINI' },
  { pin: '23S01A0549', name: 'PANDAVA GANESH' },
  { pin: '23S01A0550', name: 'PEETHA HIMA KRISHNA SATYA SRI' },
  { pin: '23S01A0551', name: 'PEYYALA NIHARIKA' },
  { pin: '23S01A0552', name: 'PEYYELA BHANUREKHA' },
  { pin: '23S01A0553', name: 'PULAPAKORU HIMABINDU' },
  { pin: '23S01A0554', name: 'PYLA SAI GANESH' },
  { pin: '23S01A0555', name: 'SABBITHI PRAVALLIKA' },
  { pin: '23S01A0556', name: 'SANAPATHI MOUNIKA' },
  { pin: '23S01A0558', name: 'SAYILA RAHUL KUMAR' },
  { pin: '23S01A0559', name: 'SOMALA SISWA' },
  { pin: '23S01A0560', name: 'SRIMANTHULA AKHILA' },
  { pin: '23S01A0561', name: 'SUNKARI SRI SOWKYA CHANDRIKA' },
  { pin: '23S01A0562', name: 'SUNTRU VISWA REDDY' },
  { pin: '23S01A0564', name: 'THAKASI BALAJI' },
  { pin: '23S01A0565', name: 'THIPARALA PUSHPA' },
  { pin: '23S01A0566', name: 'UNDRASAPU SAILAJA' },
  { pin: '23S01A0567', name: 'UNDURTHI PAPA' },
  { pin: '23S01A0568', name: 'UNGARALA GANGADHAR SWAMY' },
  { pin: '23S01A0569', name: 'VELICHETI SURYA VENKATA SAI SRI' },
  { pin: '23S01A0570', name: 'VEMAGIRI SANDHYA' },
  { pin: '23S01A0571', name: 'VIPPARTHI SANDYA' },
  { pin: '23S01A0573', name: 'ALLI LAHARI' },
  { pin: '23S01A0574', name: 'GONDESI TEJESH REDDY' },
  { pin: '23S01A0575', name: 'GORRELA PRAVEEN KUMAR' },
  { pin: '23S01A0576', name: 'LINGAMPALLI CHARISHMA SAI' },
  { pin: '23S01A0577', name: 'MAKIREDDY ROSHINI' },
  { pin: '23S01A0578', name: 'MARADA MAHESH' },
  { pin: '23S01A0579', name: 'RYALI DHATRI SIDDHI VENKATA LAKSHMI' },
  { pin: '23S01A0580', name: 'TUTTA BHAVANI ANUSHA' },
  { pin: '23S01A0583', name: 'KUNCHE MOUNIKA' },
  { pin: '23S01A0586', name: 'KALE SAI PRANEETH' },
  { pin: '23S01A0589', name: 'KUNDRAPU CHETANA' },
  { pin: '23S01A0590', name: 'REGELLA VARSHINI' },
  { pin: '23S01A0591', name: 'NAKKA KUSUMA' },
  { pin: '23S01A0592', name: 'PAGADALA NARENDRA' },
  { pin: '23S01A0594', name: 'PALAVALASA SANTHOSHKUMAR' },
  { pin: '23S01A0598', name: 'UBA SALOMI PRIYANKA' },
  { pin: '24S05A0501', name: 'VELLANKI KAVYA SRI SATYA SAI' },
  { pin: '24S05A0502', name: 'DIBBADA VAMSI PRAVEEN KUMAR' },
  { pin: '24S05A0503', name: 'LALAM SANTHOSH KUMAR' },
  { pin: '24S05A0504', name: 'MALLI SATTI BHARATH' },
  { pin: '24S05A0505', name: 'PACHARA CHANDU' }
];

// Artificial Intelligence & Data Science Students (11)
const cistAiDsStudents = [
  { pin: '23S01A5401', name: 'BATTINA GOWTHAMI' },
  { pin: '23S01A5402', name: 'CHEVALA KARTHIK' },
  { pin: '23S01A5403', name: 'JAGADAM DHARANI' },
  { pin: '23S01A5404', name: 'KOTHALA KIRAN KUMAR' },
  { pin: '23S01A5405', name: 'PEYYALA SHALINI' },
  { pin: '23S01A5406', name: 'KILLANA BALAJI' },
  { pin: '23S01A5407', name: 'BONDU ANITHA' },
  { pin: '23S01A5409', name: 'VOLLA MOHAN KUMAR' },
  { pin: '23S01A5410', name: 'PULAPAKURA MANJU' },
  { pin: '24S05A5402', name: 'PADAMATI SWARUPA SANJANA' },
  { pin: '24S05A5403', name: 'SINAMAREDDI SAI' }
];

const seedData = async () => {
  try {
    await initDb();
    console.log('Resetting and seeding fresh CIST database (0 attendance logs)...');

    // Clear all existing attendance data for clean fresh start
    await dbRun('DELETE FROM attendance');
    await dbRun('DELETE FROM courses');
    await dbRun('DELETE FROM students');

    // Insert Courses
    const courses = [
      { code: 'CSE101', name: 'Data Structures & Algorithms', department: 'Computer Science & Engineering' },
      { code: 'CSE201', name: 'Database Management Systems', department: 'Computer Science & Engineering' },
      { code: 'AIDS101', name: 'Introduction to AI & Data Science', department: 'Artificial Intelligence & Data Science' },
      { code: 'AIDS201', name: 'Machine Learning & Neural Networks', department: 'Artificial Intelligence & Data Science' }
    ];

    for (const c of courses) {
      await dbRun('INSERT INTO courses (code, name, department) VALUES (?, ?, ?)', [c.code, c.name, c.department]);
    }
    console.log('Courses seeded.');

    // Insert CSE Students (88)
    for (const s of cistCseStudents) {
      const email = `${s.name.toLowerCase().replace(/\s+/g, '.')}@cist.ac.in`;
      await dbRun(
        'INSERT INTO students (qrcode_id, barcode_id, roll_number, name, department, email) VALUES (?, ?, ?, ?, ?, ?)',
        [s.pin, s.pin, s.pin, s.name, 'Computer Science & Engineering', email]
      );
    }
    console.log(`Seeded ${cistCseStudents.length} CSE Students.`);

    // Insert AI & DS Students (11)
    for (const s of cistAiDsStudents) {
      const email = `${s.name.toLowerCase().replace(/\s+/g, '.')}@cist.ac.in`;
      await dbRun(
        'INSERT INTO students (qrcode_id, barcode_id, roll_number, name, department, email) VALUES (?, ?, ?, ?, ?, ?)',
        [s.pin, s.pin, s.pin, s.name, 'Artificial Intelligence & Data Science', email]
      );
    }
    console.log(`Seeded ${cistAiDsStudents.length} Artificial Intelligence & Data Science Students.`);

    console.log('All attendance records reset to 0. Ready for live camera detection!');
    console.log('CIST Database reset completed successfully!');
  } catch (error) {
    console.error('Reset/Seeding error:', error);
  } finally {
    db.close();
  }
};

seedData();
