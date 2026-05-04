"""
seed_data.py — Run once to populate ./data/ with all seed CSVs.
Usage: python seed_data.py
"""
import csv, os

DATA = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA, exist_ok=True)

def write(filename, fields, rows):
    path = os.path.join(DATA, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f"✅  Created {filename} ({len(rows)} rows)")

# ── Students ──────────────────────────────────────────────────────────────────
write("students.csv",
    ["id","name","dept","year","batch","gender","dob","phone","email","status","cgpa","fee_status","fees_paid","fees_due","transport","guardian","address"],
    [
        {"id":"S001","name":"Arjun Mehta","dept":"CSE","year":3,"batch":2022,"gender":"Male","dob":"2002-04-15","phone":"9876543210","email":"arjun@uni.ac.in","status":"Active","cgpa":8.7,"fee_status":"Paid","fees_paid":125000,"fees_due":0,"transport":"Route A","guardian":"Suresh Mehta","address":"12A MG Road, Bengaluru"},
        {"id":"S002","name":"Priya Sharma","dept":"ECE","year":2,"batch":2023,"gender":"Female","dob":"2003-07-22","phone":"9876543211","email":"priya@uni.ac.in","status":"Active","cgpa":9.1,"fee_status":"Paid","fees_paid":125000,"fees_due":0,"transport":"Route B","guardian":"Rajan Sharma","address":"45 Koramangala, Bengaluru"},
        {"id":"S003","name":"Rahul Verma","dept":"ME","year":4,"batch":2021,"gender":"Male","dob":"2001-01-10","phone":"9876543212","email":"rahul@uni.ac.in","status":"Active","cgpa":7.5,"fee_status":"Pending","fees_paid":62500,"fees_due":62500,"transport":"Own","guardian":"Anil Verma","address":"7 BTM Layout, Bengaluru"},
        {"id":"S004","name":"Sneha Patel","dept":"CSE","year":1,"batch":2024,"gender":"Female","dob":"2004-11-03","phone":"9876543213","email":"sneha@uni.ac.in","status":"Active","cgpa":8.2,"fee_status":"Paid","fees_paid":125000,"fees_due":0,"transport":"Route A","guardian":"Kiran Patel","address":"23 Whitefield, Bengaluru"},
        {"id":"S005","name":"Karan Singh","dept":"EEE","year":3,"batch":2022,"gender":"Male","dob":"2002-06-18","phone":"9876543214","email":"karan@uni.ac.in","status":"Inactive","cgpa":6.9,"fee_status":"Overdue","fees_paid":50000,"fees_due":75000,"transport":"Route C","guardian":"Harjit Singh","address":"56 Marathahalli, Bengaluru"},
        {"id":"S006","name":"Divya Nair","dept":"IT","year":2,"batch":2023,"gender":"Female","dob":"2003-09-25","phone":"9876543215","email":"divya@uni.ac.in","status":"Active","cgpa":9.4,"fee_status":"Paid","fees_paid":125000,"fees_due":0,"transport":"Route B","guardian":"Suresh Nair","address":"8 Electronic City, Bengaluru"},
        {"id":"S007","name":"Amit Joshi","dept":"CE","year":3,"batch":2022,"gender":"Male","dob":"2002-03-11","phone":"9876543216","email":"amit@uni.ac.in","status":"Active","cgpa":7.8,"fee_status":"Paid","fees_paid":125000,"fees_due":0,"transport":"Route D","guardian":"Mohan Joshi","address":"34 JP Nagar, Bengaluru"},
        {"id":"S008","name":"Riya Menon","dept":"CSE","year":4,"batch":2021,"gender":"Female","dob":"2001-12-05","phone":"9876543217","email":"riya@uni.ac.in","status":"Active","cgpa":8.9,"fee_status":"Paid","fees_paid":125000,"fees_due":0,"transport":"Own","guardian":"Thomas Menon","address":"90 Indiranagar, Bengaluru"},
        {"id":"S009","name":"Vikram Reddy","dept":"CSE","year":2,"batch":2023,"gender":"Male","dob":"2003-05-20","phone":"9876543218","email":"vikram@uni.ac.in","status":"Active","cgpa":7.3,"fee_status":"Pending","fees_paid":60000,"fees_due":65000,"transport":"Route A","guardian":"Suresh Reddy","address":"15 Banjara Hills, Hyderabad"},
        {"id":"S010","name":"Pooja Desai","dept":"ECE","year":1,"batch":2024,"gender":"Female","dob":"2005-02-14","phone":"9876543219","email":"pooja@uni.ac.in","status":"Active","cgpa":8.5,"fee_status":"Paid","fees_paid":125000,"fees_due":0,"transport":"Route B","guardian":"Mahesh Desai","address":"22 Jubilee Hills, Hyderabad"},
    ]
)

# ── Alumni ────────────────────────────────────────────────────────────────────
write("alumni.csv",
    ["id","name","dept","batch","phone","email","company","role","cgpa","message"],
    [
        {"id":"AL001","name":"Aditya Kumar","dept":"CSE","batch":2020,"phone":"9900001111","email":"aditya.k@gmail.com","company":"Google","role":"Software Engineer","cgpa":9.1,"message":"Great institution!"},
        {"id":"AL002","name":"Meera Pillai","dept":"ECE","batch":2019,"phone":"9900002222","email":"meera.p@outlook.com","company":"Qualcomm","role":"VLSI Design Engineer","cgpa":8.7,"message":"Top-notch labs."},
        {"id":"AL003","name":"Rohan Sharma","dept":"ME","batch":2020,"phone":"9900003333","email":"rohan.s@yahoo.com","company":"Tata Motors","role":"Design Engineer","cgpa":7.9,"message":"Practical exposure was excellent."},
        {"id":"AL004","name":"Kavya Nair","dept":"IT","batch":2021,"phone":"9900004444","email":"kavya.n@gmail.com","company":"Infosys","role":"Senior Analyst","cgpa":8.4,"message":"Faculty support was amazing."},
        {"id":"AL005","name":"Sanjay Gupta","dept":"EEE","batch":2019,"phone":"9900005555","email":"sanjay.g@hotmail.com","company":"L&T","role":"Electrical Engineer","cgpa":7.6,"message":"Proud alumnus!"},
    ]
)

# ── Staff ─────────────────────────────────────────────────────────────────────
write("staff.csv",
    ["id","name","dept","role","type","qual","exp","publications","status","email","phone"],
    [
        {"id":"T001","name":"Dr. Ramesh Kumar","dept":"CSE","role":"Professor & HoD","type":"Teaching","qual":"Ph.D.","exp":22,"publications":34,"status":"Active","email":"ramesh@uni.ac.in","phone":"9811000001"},
        {"id":"T002","name":"Prof. Anita Das","dept":"CSE","role":"Associate Professor","type":"Teaching","qual":"M.Tech","exp":14,"publications":12,"status":"Active","email":"anita@uni.ac.in","phone":"9811000002"},
        {"id":"T003","name":"Dr. Sunita Rao","dept":"ECE","role":"Professor & HoD","type":"Teaching","qual":"Ph.D.","exp":19,"publications":28,"status":"Active","email":"sunita@uni.ac.in","phone":"9811000003"},
        {"id":"T004","name":"Dr. Vijay Patil","dept":"ME","role":"Professor & HoD","type":"Teaching","qual":"Ph.D.","exp":17,"publications":21,"status":"Active","email":"vijay@uni.ac.in","phone":"9811000004"},
        {"id":"T005","name":"Dr. Meena Iyer","dept":"IT","role":"Professor & HoD","type":"Teaching","qual":"Ph.D.","exp":15,"publications":18,"status":"Active","email":"meena@uni.ac.in","phone":"9811000005"},
        {"id":"T006","name":"Prof. Kiran Nair","dept":"EEE","role":"Assistant Professor","type":"Teaching","qual":"M.Tech","exp":8,"publications":6,"status":"Active","email":"kiran@uni.ac.in","phone":"9811000006"},
        {"id":"S001","name":"Rajesh Nair","dept":"ADM","role":"Registrar","type":"Support","qual":"MBA","exp":12,"publications":0,"status":"Active","email":"reg@uni.ac.in","phone":"9811000007"},
        {"id":"S002","name":"Kavitha M.","dept":"LIB","role":"Chief Librarian","type":"Support","qual":"MLIS","exp":9,"publications":2,"status":"Active","email":"lib@uni.ac.in","phone":"9811000008"},
        {"id":"S003","name":"Suresh P.","dept":"IT","role":"System Admin","type":"Support","qual":"B.Tech","exp":7,"publications":0,"status":"Active","email":"it@uni.ac.in","phone":"9811000009"},
    ]
)

# ── Departments ───────────────────────────────────────────────────────────────
write("departments.csv",
    ["id","name","hod","faculty","students","estd","pg"],
    [
        {"id":"CSE","name":"Computer Science & Engineering","hod":"Dr. Ramesh Kumar","faculty":18,"students":480,"estd":1995,"pg":"M.Tech CSE, Ph.D."},
        {"id":"ECE","name":"Electronics & Comm. Engineering","hod":"Dr. Sunita Rao","faculty":15,"students":360,"estd":1997,"pg":"M.Tech VLSI"},
        {"id":"ME", "name":"Mechanical Engineering","hod":"Dr. Vijay Patil","faculty":20,"students":420,"estd":1992,"pg":"M.Tech Thermal"},
        {"id":"EEE","name":"Electrical & Electronics Engg.","hod":"Dr. Pradeep Gupta","faculty":14,"students":300,"estd":1998,"pg":"M.Tech Power"},
        {"id":"IT", "name":"Information Technology","hod":"Dr. Meena Iyer","faculty":12,"students":240,"estd":2001,"pg":"MCA"},
        {"id":"CE", "name":"Civil Engineering","hod":"Dr. Anil Mishra","faculty":16,"students":350,"estd":1992,"pg":"M.Tech Structural"},
    ]
)

# ── Courses ───────────────────────────────────────────────────────────────────
write("courses.csv",
    ["code","name","dept","credits","type","faculty","sem","students","syllabus"],
    [
        {"code":"CS601","name":"Machine Learning","dept":"CSE","credits":4,"type":"Core","faculty":"Dr. Ramesh Kumar","sem":6,"students":120,"syllabus":"ML algorithms, Neural networks, Deep learning"},
        {"code":"CS502","name":"Database Systems","dept":"CSE","credits":3,"type":"Core","faculty":"Prof. Anita Das","sem":5,"students":115,"syllabus":"SQL, NoSQL, ACID, Normalization"},
        {"code":"EC401","name":"VLSI Design","dept":"ECE","credits":4,"type":"Core","faculty":"Dr. Sunita Rao","sem":7,"students":88,"syllabus":"CMOS design, Layout, RTL synthesis"},
        {"code":"ME301","name":"Fluid Mechanics","dept":"ME","credits":3,"type":"Core","faculty":"Dr. Vijay Patil","sem":3,"students":98,"syllabus":"Bernoulli, Reynolds, Pipe flow"},
        {"code":"CS701","name":"Cloud Computing","dept":"CSE","credits":3,"type":"Elective","faculty":"Prof. Anita Das","sem":7,"students":75,"syllabus":"AWS, Azure, Docker, K8s"},
        {"code":"HS101","name":"Engineering Ethics","dept":"HUM","credits":2,"type":"Mandatory","faculty":"Dr. Priya Mohan","sem":1,"students":480,"syllabus":"Professional responsibility, IPR"},
        {"code":"IT401","name":"Web Technologies","dept":"IT","credits":3,"type":"Core","faculty":"Dr. Meena Iyer","sem":4,"students":62,"syllabus":"HTML5, CSS3, React, Node.js"},
        {"code":"EE501","name":"Power Systems","dept":"EEE","credits":4,"type":"Core","faculty":"Prof. Kiran Nair","sem":5,"students":78,"syllabus":"Load flow, Fault analysis"},
    ]
)

# ── Exams ─────────────────────────────────────────────────────────────────────
write("exams.csv",
    ["id","name","dept","type","date","status","total","hall_tickets"],
    [
        {"id":"E001","name":"End Semester — Nov 2024","dept":"All","type":"Semester","date":"2024-11-18","status":"Completed","total":1850,"hall_tickets":"true"},
        {"id":"E002","name":"Mid Semester — Sept 2024","dept":"All","type":"Mid Term","date":"2024-09-10","status":"Completed","total":1850,"hall_tickets":"true"},
        {"id":"E003","name":"Supplementary — Dec 2024","dept":"All","type":"Supplementary","date":"2024-12-05","status":"Completed","total":140,"hall_tickets":"true"},
        {"id":"E004","name":"Internal Assessment — Jan 2025","dept":"CSE","type":"Internal","date":"2025-01-15","status":"Upcoming","total":480,"hall_tickets":"false"},
        {"id":"E005","name":"End Semester — May 2025","dept":"All","type":"Semester","date":"2025-05-12","status":"Scheduled","total":1850,"hall_tickets":"false"},
        {"id":"E006","name":"Practical Exam — Feb 2025","dept":"CSE","type":"Practical","date":"2025-02-20","status":"Scheduled","total":480,"hall_tickets":"false"},
    ]
)

# ── Fees ──────────────────────────────────────────────────────────────────────
write("fees.csv",
    ["id","type","amount","freq","due_date","collected","pending"],
    [
        {"id":"F001","type":"Tuition Fee","amount":125000,"freq":"Annual","due_date":"2024-07-31","collected":118750,"pending":6250},
        {"id":"F002","type":"Hostel Fee","amount":65000,"freq":"Annual","due_date":"2024-07-31","collected":58500,"pending":6500},
        {"id":"F003","type":"Transport Fee","amount":18000,"freq":"Annual","due_date":"2024-07-31","collected":16200,"pending":1800},
        {"id":"F004","type":"Lab Fee","amount":8000,"freq":"Semester","due_date":"2024-08-15","collected":7600,"pending":400},
        {"id":"F005","type":"Exam Fee","amount":2500,"freq":"Semester","due_date":"2024-10-01","collected":2400,"pending":100},
    ]
)

# ── Transport ─────────────────────────────────────────────────────────────────
write("transport.csv",
    ["id","name","area","stops","students","driver","bus","time","contact"],
    [
        {"id":"R001","name":"Route A","area":"Koramangala – Indiranagar","stops":8,"students":42,"driver":"Ravi Kumar","bus":"KA-01-AB-1234","time":"7:30 AM","contact":"9900001111"},
        {"id":"R002","name":"Route B","area":"Whitefield – Marathahalli","stops":6,"students":35,"driver":"Suresh M.","bus":"KA-01-CD-5678","time":"7:45 AM","contact":"9900002222"},
        {"id":"R003","name":"Route C","area":"Electronic City – BTM","stops":10,"students":58,"driver":"Mahesh P.","bus":"KA-01-EF-9012","time":"7:15 AM","contact":"9900003333"},
        {"id":"R004","name":"Route D","area":"Jayanagar – JP Nagar","stops":7,"students":29,"driver":"Ramesh N.","bus":"KA-01-GH-3456","time":"7:40 AM","contact":"9900004444"},
    ]
)

# ── Attendance ────────────────────────────────────────────────────────────────
write("attendance.csv",
    ["id","student_id","student_name","dept","date","status","month","year"],
    [
        {"id":"AT0001","student_id":"S001","student_name":"Arjun Mehta","dept":"CSE","date":"2025-01-06","status":"P","month":"Jan 2025","year":2025},
        {"id":"AT0002","student_id":"S001","student_name":"Arjun Mehta","dept":"CSE","date":"2025-01-07","status":"P","month":"Jan 2025","year":2025},
        {"id":"AT0003","student_id":"S001","student_name":"Arjun Mehta","dept":"CSE","date":"2025-01-08","status":"A","month":"Jan 2025","year":2025},
        {"id":"AT0004","student_id":"S002","student_name":"Priya Sharma","dept":"ECE","date":"2025-01-06","status":"P","month":"Jan 2025","year":2025},
        {"id":"AT0005","student_id":"S002","student_name":"Priya Sharma","dept":"ECE","date":"2025-01-07","status":"P","month":"Jan 2025","year":2025},
        {"id":"AT0006","student_id":"S004","student_name":"Sneha Patel","dept":"CSE","date":"2025-01-06","status":"P","month":"Jan 2025","year":2025},
        {"id":"AT0007","student_id":"S004","student_name":"Sneha Patel","dept":"CSE","date":"2025-01-07","status":"A","month":"Jan 2025","year":2025},
        {"id":"AT0008","student_id":"S005","student_name":"Karan Singh","dept":"EEE","date":"2025-01-06","status":"A","month":"Jan 2025","year":2025},
        {"id":"AT0009","student_id":"S005","student_name":"Karan Singh","dept":"EEE","date":"2025-01-07","status":"A","month":"Jan 2025","year":2025},
        {"id":"AT0010","student_id":"S006","student_name":"Divya Nair","dept":"IT","date":"2025-01-06","status":"P","month":"Jan 2025","year":2025},
        {"id":"AT0011","student_id":"S001","student_name":"Arjun Mehta","dept":"CSE","date":"2025-02-03","status":"P","month":"Feb 2025","year":2025},
        {"id":"AT0012","student_id":"S001","student_name":"Arjun Mehta","dept":"CSE","date":"2025-02-04","status":"P","month":"Feb 2025","year":2025},
        {"id":"AT0013","student_id":"S002","student_name":"Priya Sharma","dept":"ECE","date":"2025-02-03","status":"A","month":"Feb 2025","year":2025},
    ]
)

# ── Certificates ──────────────────────────────────────────────────────────────
write("certificates.csv",
    ["id","type","student","date","status","verif"],
    [
        {"id":"C001","type":"Degree Certificate","student":"Arjun Mehta","date":"2024-05-20","status":"Issued","verif":"VER-2024-001"},
        {"id":"C002","type":"Provisional Certificate","student":"Priya Sharma","date":"2024-06-01","status":"Issued","verif":"VER-2024-002"},
        {"id":"C003","type":"Bonafide Certificate","student":"Rahul Verma","date":"2024-07-10","status":"Issued","verif":"VER-2024-003"},
        {"id":"C004","type":"Transcript","student":"Sneha Patel","date":"2024-07-15","status":"Pending","verif":"—"},
        {"id":"C005","type":"Migration Certificate","student":"Karan Singh","date":"2024-08-01","status":"Issued","verif":"VER-2024-005"},
    ]
)

# ── Publications ──────────────────────────────────────────────────────────────
write("publications.csv",
    ["id","title","author","journal","year","type","impact"],
    [
        {"id":"P001","title":"Deep Learning for Crop Disease Detection","author":"Dr. Ramesh Kumar","journal":"IEEE Access","year":2024,"type":"Journal","impact":3.9},
        {"id":"P002","title":"5G MIMO Antenna Design for mmWave","author":"Dr. Sunita Rao","journal":"Springer LNCS","year":2024,"type":"Conference","impact":"—"},
        {"id":"P003","title":"Predictive Maintenance in Manufacturing","author":"Dr. Vijay Patil","journal":"Int. J. Adv. Manuf.","year":2023,"type":"Journal","impact":4.2},
        {"id":"P004","title":"Cloud-Native ERP for Academia","author":"Dr. Meena Iyer","journal":"ACM SIGCSE","year":2024,"type":"Conference","impact":"—"},
        {"id":"P005","title":"IoT-based Smart Campus Energy Management","author":"Prof. Kiran Nair","journal":"Energy Reports","year":2024,"type":"Journal","impact":2.8},
    ]
)

# ── AICTE Checklist ───────────────────────────────────────────────────────────
write("aicte_checklist.csv",
    ["id","cat","item","status","note"],
    [
        {"id":"AC001","cat":"Infrastructure","item":"Carpet area per student ≥ 1.5 sq.m","status":"ok","note":"Current: 2.1 sq.m"},
        {"id":"AC002","cat":"Infrastructure","item":"Computer lab ratio 1:2 (student:system)","status":"ok","note":"Ratio: 1:1.8"},
        {"id":"AC003","cat":"Infrastructure","item":"Library with ≥ 2000 titles/dept","status":"ok","note":"14,200 titles"},
        {"id":"AC004","cat":"Faculty","item":"Faculty:Student ratio ≤ 1:15","status":"warn","note":"Current 1:18 — action needed"},
        {"id":"AC005","cat":"Faculty","item":"≥ 60% Ph.D. qualified faculty","status":"ok","note":"67% Ph.D."},
        {"id":"AC006","cat":"Faculty","item":"Faculty vacancies ≤ 10%","status":"ok","note":"4% vacant"},
        {"id":"AC007","cat":"Finances","item":"Endowment fund ≥ ₹5 Cr","status":"ok","note":"₹8.2 Cr"},
        {"id":"AC008","cat":"Finances","item":"Fee refund policy displayed","status":"ok","note":"Published on website"},
        {"id":"AC009","cat":"Academics","item":"Outcome Based Education (OBE) implemented","status":"ok","note":"All programs"},
        {"id":"AC010","cat":"Academics","item":"NBA/NAAC accreditation current","status":"warn","note":"NAAC expires Mar 2025"},
        {"id":"AC011","cat":"Academics","item":"Scopus/SCI publications","status":"ok","note":"62 papers (2024)"},
        {"id":"AC012","cat":"Compliance","item":"Anti-ragging committee active","status":"ok","note":"Constituted Jun 2024"},
        {"id":"AC013","cat":"Compliance","item":"Grievance redressal cell functional","status":"ok","note":"Online portal active"},
        {"id":"AC014","cat":"Compliance","item":"IQAC active","status":"ok","note":"Minutes updated quarterly"},
        {"id":"AC015","cat":"Compliance","item":"Annual reports submitted to AICTE portal","status":"warn","note":"2023-24 pending upload"},
    ]
)

# ── AICTE Inspection Calendar ─────────────────────────────────────────────────
write("aicte_inspections.csv",
    ["id","date","title","body","color"],
    [
        {"id":"IN001","date":"Mar 2025","title":"NAAC Peer Team Visit","body":"Accreditation Renewal","color":"tl-red"},
        {"id":"IN002","date":"Apr 2025","title":"AICTE Annual Compliance Report","body":"Annual Compliance Report Submission","color":"tl-gold"},
        {"id":"IN003","date":"Jun 2025","title":"UGC Inspection","body":"Deemed University Review","color":"tl-blue"},
        {"id":"IN004","date":"Aug 2025","title":"NBA Technical Review","body":"CSE & ECE Programs","color":"tl-purple"},
    ]
)

# ── AICTE Institution Records ─────────────────────────────────────────────────
write("aicte_institution.csv",
    ["id","key","value"],
    [
        {"id":"IR001","key":"Institution Type","value":"Deemed University (De-Novo)"},
        {"id":"IR002","key":"AICTE Approval No.","value":"AICTE/FN/1-23456789/2024"},
        {"id":"IR003","key":"UGC Recognition","value":"UGC Act 1956, Section 3"},
        {"id":"IR004","key":"Established","value":"1992"},
        {"id":"IR005","key":"Campus Area","value":"125 Acres"},
        {"id":"IR006","key":"Hostels","value":"4 (Boys: 2, Girls: 2)"},
        {"id":"IR007","key":"NAAC Grade","value":"A+ (CGPA 3.62)"},
        {"id":"IR008","key":"NBA Accredited","value":"CSE, ECE, ME (2022–25)"},
    ]
)

# ── Batches ───────────────────────────────────────────────────────────────────
write("batches.csv",
    ["id","year","dept","students","mentor"],
    [
        {"id":"B001","year":"2020","dept":"CSE","students":120,"mentor":"Dr. Ramesh Kumar"},
        {"id":"B002","year":"2020","dept":"ECE","students":95,"mentor":"Dr. Sunita Rao"},
        {"id":"B003","year":"2020","dept":"ME","students":80,"mentor":"Dr. Vijay Patil"},
        {"id":"B004","year":"2021","dept":"CSE","students":130,"mentor":"Prof. Anita Das"},
        {"id":"B005","year":"2021","dept":"EEE","students":85,"mentor":"Dr. Pradeep Gupta"},
        {"id":"B006","year":"2021","dept":"IT","students":70,"mentor":"Dr. Meena Iyer"},
        {"id":"B007","year":"2022","dept":"CSE","students":140,"mentor":"Dr. Ramesh Kumar"},
        {"id":"B008","year":"2022","dept":"ECE","students":100,"mentor":"Dr. Sunita Rao"},
        {"id":"B009","year":"2022","dept":"CE","students":75,"mentor":"Dr. Anil Mishra"},
        {"id":"B010","year":"2023","dept":"CSE","students":150,"mentor":"Prof. Anita Das"},
        {"id":"B011","year":"2023","dept":"IT","students":80,"mentor":"Dr. Meena Iyer"},
        {"id":"B012","year":"2023","dept":"EEE","students":90,"mentor":"Dr. Pradeep Gupta"},
        {"id":"B013","year":"2024","dept":"CSE","students":160,"mentor":"Dr. Ramesh Kumar"},
        {"id":"B014","year":"2024","dept":"ECE","students":110,"mentor":"Dr. Sunita Rao"},
        {"id":"B015","year":"2024","dept":"ME","students":85,"mentor":"Dr. Vijay Patil"},
    ]
)

# ── Alerts ────────────────────────────────────────────────────────────────────
write("alerts.csv",
    ["id","title","message","type","date"],
    [
        {"id":"ALR001","title":"NAAC Accreditation Expiring","message":"NAAC accreditation expires March 2025 — renewal process must begin immediately.","type":"warn","date":"2025-01-10"},
        {"id":"ALR002","title":"AICTE Annual Report Pending","message":"2023-24 annual report has not been uploaded to the AICTE portal.","type":"warn","date":"2025-01-12"},
        {"id":"ALR003","title":"Faculty:Student Ratio","message":"Current ratio is 1:18, exceeding AICTE norm of 1:15. Recruitment needed.","type":"warn","date":"2025-01-15"},
    ]
)

print("\n🎉 All seed CSV files created successfully in ./data/")