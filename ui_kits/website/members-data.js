window.boss = {
  no: "隊長",
  name: "Poeency",
  role: "Đại ca · Founder",
  km: "総督",
  note: "Người dựng CyberKnight từ con số không. Không code exploit nữa — giờ chỉ mài giũa những kẻ sẽ làm điều đó. Kỷ luật trước, kỹ thuật sau.",
  tenure: "創立 2023.09",
  slot: "boss"
};

window.members = [
  { no: "NO.01", nm: "trieudailuong", rl: "Co-founder · Web Exploit", km: "攻性", photo: "../../assets/lead.png", q: "Mọi deserializer đều dối trá cho đến khi bị chứng minh ngược lại.", tn: "2023.09" },
  { no: "NO.02", nm: "Katun", rl: "Co-founder · Reverse", km: "解析", photo: "../../assets/m-b.png", q: "Thời gian sẽ thu hẹp mọi khoảng cách — kể cả với binary khó nhất.", tn: "2023.09" },
  { no: "NO.03", nm: "BouMiu", rl: "Co-founder · Pwnable", km: "爆破", photo: "../../assets/mem3.png", q: "Time will narrow every disparity. Một byte tràn là đủ.", tn: "2023.09" },
  { no: "NO.04", nm: "toobunbo", rl: "Phó CLB · Crypto", km: "暗号", photo: "../../assets/pho-goat.png", q: "Toán học không biết nói dối. Chỉ có triển khai mới sai.", tn: "2024.01" },
  { no: "NO.05", nm: "codex", rl: "Forensics", km: "鑑識", photo: "../../assets/mem5.2.png", q: "Mọi thứ đều để lại dấu vết. Việc của tôi là đọc chúng.", tn: "2024.02" },
  { no: "NO.06", nm: "noctu", rl: "Network", km: "通信", q: "Gói tin không nói dối. Người cấu hình chúng thì có.", tn: "2024.03" },
  { no: "NO.07", nm: "sable", rl: "OSINT", km: "諜報", q: "Câu trả lời luôn công khai — chỉ là chưa ai chịu ghép lại.", tn: "2024.03" },
  { no: "NO.08", nm: "kryo", rl: "Mobile", km: "携帯", q: "Cái app trong túi bạn tin tưởng quá nhiều thứ.", tn: "2024.04" },
  { no: "NO.09", nm: "vex", rl: "Hardware", km: "回路", q: "Firmware là phần mềm quên mất rằng nó đang bị nhìn.", tn: "2024.05" },
  { no: "NO.10", nm: "orin", rl: "Blockchain", km: "連鎖", q: "Bất biến không có nghĩa là bất khả xâm phạm.", tn: "2024.06" },
];

const M_KM = ["修", "習", "新", "初", "門", "芽", "若", "進", "志", "礎", "練", "始", "士", "歩", "勤", "伸", "望", "炎", "風", "雷", "華", "刃", "岩"];
const M_ROLES = ["Web", "Pwn", "Rev", "Crypto", "Forensics", "Network", "OSINT", "Mobile", "Misc"];
const M_Q = ["Chưa viết ghi chú. Đang mài kiếm.", "Học để phá, phá để hiểu.", "Mỗi CTF là một chương mới.", "Còn noob, nhưng không còn lâu nữa."];

for (let i = 0; i < 23; i++) {
  window.members.push({
    no: "NO." + String(i + 11).padStart(2, "0"),
    nm: "kn_" + String(i + 11).padStart(2, "0"),
    rl: M_ROLES[i % M_ROLES.length],
    km: M_KM[i % M_KM.length],
    q: M_Q[i % M_Q.length],
    tn: "2024." + String((i % 12) + 1).padStart(2, "0"),
  });
}
