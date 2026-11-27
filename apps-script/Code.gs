/**
 * ===== WEB TỰ HỌC ANH – TRUNG – KIDS (BÁN GÓI) · bản tách 21/11/2026, sửa 24/11/2026 =====
 * 24/11/2026 (chị Duyên chốt): một KHOÁ HỌC gồm Little Seed rồi Seedling nối tiếp, không nhảy cóc.
 *  - Bán gói 3 tháng, 6 tháng, 1 năm (sau này Canopy gối vào gói 1 năm: thêm 'cp' vào LO_TRINH).
 *  - Mỗi khách một MÃ KHOÁ HỌC (dòng HocSinh lop = 'ls'): PIN, máy, gói, hạn dùng đều theo dòng này.
 *  - Web Seedling dùng CHÍNH mã đó. Seedling chỉ mở khi con học xong 99 ngày Little Seed (cột ngay của dòng mã ≥ 99),
 *    hoặc khi đội CES ghi x vào cột mo_sd (trường hợp đặc biệt). Tiến độ Seedling lưu ở dòng riêng id = MÃ.sd (nguon = lo_trinh).
 *  - Seedling không có học thử, không đăng nhập bằng tên. Học thử: Unit 1 Little Seed.
 * Gắn với Sheet "Anh Trung Kids Tự học": https://docs.google.com/spreadsheets/d/1Yw3iS1oraI2Rc0YzGU6nVP_Qd-6AFRjdbGda9hasgc0/edit
 * Khác máy chủ lớp offline:
 *  - Mỗi khách một MÃ KÍCH HOẠT (mã + PIN 4 số) gắn với MỘT level (ls = Little Seed, sd = Seedling) và một gói:
 *    1 tháng, 3 tháng, 6 tháng, 12 tháng, trọn đời (cột goi, so_thang). Hạn tính từ lần đăng nhập đầu tiên bằng mã (kich_hoat).
 *    Hết hạn: web không lưu/tải bài, chỉ còn Unit 1 học thử. Gia hạn: cộng gói vào chính mã đó (còn hạn thì nối tiếp, hết hạn thì tính lại từ hôm gia hạn).
 *  - Mã của level nào chỉ đăng nhập được web level đó.
 *  - Trang quản trị (quan-tri/) đăng nhập bằng TÀI KHOẢN RIÊNG từng người (tab QuanTriVien), không dùng PIN lớp.
 *    Vai trò: "Quản lý" (tạo tài khoản đội, cấp mã, gia hạn) và "Nhân viên" (cấp mã, gia hạn, xem học tập, ghi chú).
 *    Mọi việc cấp mã, gia hạn, sửa tài khoản ghi một dòng ở tab NhatKyQT (ai, lúc nào, việc gì).
 *  - Lần đầu: chạy hàm caiDat() một lần; mã thiết lập tài khoản Quản lý đầu tiên nằm ở tab CaiDatQT.
 * ------------------------------------------------------------------------------------------------------------
 * (Phần dưới giữ nguyên mô tả của máy chủ lớp offline 48 buổi mà bản này được chép ra.)
 * MÁY CHỦ LỚP OFFLINE 48 BUỔI · Little Seed + Seedling (Google Apps Script gắn với Google Sheet quản lý)
 *
 * Một Sheet, một link /exec dùng chung cho cả hai web:
 *   little-seed/ls-may-chu.js      → lop = 'ls'
 *   seedling/seedling-may-chu.js   → lop = 'sd'
 *
 * Tab trong Sheet (tự tạo nếu thiếu, chạy hàm caiDat một lần):
 *   CaiDat   : PIN của từng lớp (cô sửa thẳng trong Sheet)
 *   HocSinh  : mỗi con một dòng: lớp, mã, tên, tổng sao web, ví sao, số ngày web, lần học cuối
 *   TienDo   : bản lưu ĐẦY ĐỦ tiến độ của con (ngày đã học, Hộp ôn, sao, quà…) để con đổi máy không mất bài
 *   Thuong   : từng lượt cô thưởng sao
 *   DoiQua   : yêu cầu đổi quà thật
 *
 * Lệnh của web con (không cần PIN, chỉ cần mã con):
 *   GET  kid, hello, redeem, tai (lấy tiến độ)      POST luu (gửi tiến độ, có kiểm phiên bản)
 *   GET  video (Góc vinh danh: danh sách video trong thư mục Drive của lớp, ai cũng xem được)
 * Lệnh của Bảng của cô (cần PIN của lớp):
 *   GET  cls, award, unaward, order, addkid
 * Lệnh của Trang quản trị giáo viên (quan-tri-lop/, bản 4, cần PIN, web gọi bằng POST):
 *   qt_tai, qt_buoi, qt_gc_them, qt_gc_xoa, qt_hs, qt_lop, qt_tn_luu, qt_tn_xoa
 *   Tab mới: BuoiHS, BuoiLop, GhiChu, TaiNguyen (chạy hàm caiDatQuanTri một lần)
 * Bản 5 (tài khoản các con): PIN 4 số mỗi con (cột pin_con), nhớ tối đa max_may máy (mặc định 2), máy mới chờ cô duyệt.
 *   Phía con: dangnhap, bang (báo cáo chung con + ba mẹ). Phía cô: qt_kids_them, qt_pin, qt_may, qt_gc_chia.
 *   Con chưa có PIN: mọi thứ chạy như cũ.
 * Bản 6 (16/11/2026): con chưa có PIN đăng nhập bằng HỌ TÊN (lệnh ten). Web tìm tên trong lớp; chưa có thì tạo dòng mới
 *   (cột nguon = tu_nhap) để lưu kết quả luyện tập, đổi máy nhập lại đúng họ tên là lấy lại bài. Đăng nhập bằng tên chỉ mở Unit 1;
 *   từ Unit 2 web vẫn đòi mã + PIN do CES cấp. Con đã có PIN mà nhập tên → web hỏi PIN.
 */

const TAB = {
  CaiDat:  ['lop', 'ten_lop', 'pin', 'ghi_chu', 'video_folder', 'khai_giang', 'max_may'],
  HocSinh: ['lop', 'id', 'ten', 'tao', 'web', 'vi', 'ngay', 'cuoi', 'luu_cuoi', 'trang_thai', 'pin_con', 'may', 'cho_may', 'nguon',
            'goi', 'so_thang', 'kich_hoat', 'het_han', 'sdt', 'ghi_chu_ban', 'nguoi_cap', 'cap_luc', 'mo_sd', 'nam_sinh', 'phu_huynh', 'trinh_do_anh', 'trinh_do_trung'],   // web tự học: gói, hạn dùng, người cấp
  TienDo:  ['lop', 'id', 'v', 't', 'capnhat', 'do_dai', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6'],
  Thuong:  ['id', 'lop', 'kid', 'n', 'why', 'at', 'huy'],
  DoiQua:  ['code', 'lop', 'kid', 'ten', 'qua', 'ten_qua', 'sao', 'at', 'st', 'note'],
  /* ---- Trang quản trị giáo viên (quan-tri-lop/), bản 4 ---- */
  BuoiHS:  ['k', 'lop', 'buoi', 'kid', 'cm', 'tg', 'en', 'zh', 'bt', 'note', 'at'],   // mỗi con mỗi buổi một dòng: có mặt, tham gia, nói EN, nói ZH, bài tập (0–3)
  BuoiLop: ['k', 'lop', 'buoi', 'ngay', 'da_day', 'ghi_chu', 'at'],                   // mỗi buổi một dòng: ngày dạy, đã dạy chưa, ghi chú buổi
  GhiChu:  ['id', 'lop', 'kid', 'buoi', 'loai', 'noi_dung', 'at', 'xoa', 'chia_se'],  // nhật ký từng con; chia_se = x thì con và ba mẹ thấy trong Bảng của con
  TaiNguyen: ['id', 'lop', 'nhom', 'ten', 'url', 'ghi_chu', 'thu_tu'],                // link tài liệu của lớp (chỉ hiện sau khi nhập PIN)
  /* ---- web tự học: tài khoản quản trị từng người + nhật ký ---- */
  QuanTriVien: ['user', 'ten', 'vai_tro', 'muoi', 'hash', 'hoat_dong', 'tao', 'cuoi_vao', 'doi_mk'],
  NhatKyQT: ['at', 'user', 'ten', 'viec', 'lop', 'ma', 'chi_tiet'],
  CaiDatQT: ['khoa', 'gia_tri', 'ghi_chu']
};
const GOI = { '3t': [3, '3 tháng'], '6t': [6, '6 tháng'], '12t': [12, '1 năm'] };   // 24/11: chỉ bán 3 tháng, 6 tháng, 1 năm
const LO_TRINH = ['ls', 'sd'];   // thứ tự học trong khoá, không nhảy cóc (Canopy sau này: thêm 'cp' và cột mo_cp)
const NGAY_LEVEL = 99;           // học xong một level = đủ 99 ngày web
const VAI_TRO = ['Quản lý', 'Nhân viên'];
const PHIEN_GIO = 12;   // phiên đăng nhập trang quản trị giữ 12 giờ
const LOAI_GHI = ['tien_bo', 'ho_tro', 'phu_huynh', 'hanh_vi', 'khac'];
const LOP_MAC_DINH = [['ls', 'Little Seed · web tự học 99 ngày'], ['sd', 'Seedling · web tự học 99 ngày']];
const TEXT_COLS = { QuanTriVien: ['user', 'muoi', 'hash'], NhatKyQT: ['user', 'lop', 'ma'], CaiDatQT: ['khoa', 'gia_tri'],
  HocSinh: ['lop', 'id', 'ten', 'cuoi', 'pin_con', 'may', 'cho_may', 'nguon', 'goi', 'sdt', 'nguoi_cap', 'nam_sinh', 'phu_huynh', 'trinh_do_anh', 'trinh_do_trung'], TienDo: ['lop', 'id', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6'], Thuong: ['id', 'lop', 'kid'],
  DoiQua: ['code', 'lop', 'kid'], CaiDat: ['lop', 'pin', 'video_folder', 'khai_giang'],
  BuoiHS: ['k', 'lop', 'kid'], BuoiLop: ['k', 'lop', 'ngay'], GhiChu: ['id', 'lop', 'kid'], TaiNguyen: ['id', 'lop'] };
const VIDEO_CACHE_GIAY = 300;   // danh sách video nhớ 5 phút: video mới thả vào Drive hiện trên web chậm nhất ~5 phút
const CHUNK = 45000;           // một ô Google Sheet chứa tối đa 50.000 ký tự
const MAX_DATA = CHUNK * 6;    // ~270.000 ký tự tiến độ mỗi con

/* ===================== cổng vào ===================== */
function doGet(e) { return run_(() => handle_((e && e.parameter) || {})); }
function doPost(e) {
  return run_(() => {
    let q = {};
    try { q = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (x) { return { ok: false, err: 'Dữ liệu gửi lên không đọc được' }; }
    return handle_(q);
  });
}
function run_(fn) {
  let out; const lock = LockService.getScriptLock();
  try { lock.waitLock(15000); out = fn(); }
  catch (err) { out = { ok: false, err: String(err && err.message || err) }; }
  finally { try { lock.releaseLock(); } catch (x) {} }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/* lệnh của web con ở level sau (Seedling): kiểm mã khoá học ở dòng gốc (Little Seed) rồi mới chạy */
const KID_ACT = { dangnhap: 1, kid: 1, hello: 1, redeem: 1, tai: 1, luu: 1, bang: 1 };
function handle_(q) {
  const lop = String(q.lop || '').trim(), i = LO_TRINH.indexOf(lop);
  if (KID_ACT[q.action] && q.id != null && q.id !== '') {
    if (String(q.id).indexOf('.') >= 0) return { ok: false, err: 'Mã không hợp lệ' };   // dòng MÃ.sd chỉ máy chủ dùng
    if (i > 0) return capSau_(q, lop, i);
  }
  return handleCore_(q);
}
function capInfo_(chu, lop, i) {
  const base = String(chu.obj.id), truoc = i === 1 ? chu : find_('HocSinh', 'id', base + '.' + LO_TRINH[i - 1]);
  const ngay = truoc ? +truoc.obj.ngay || 0 : 0;
  return { mo: ngay >= NGAY_LEVEL || truthy_(chu.obj['mo_' + lop]), ngay, can: NGAY_LEVEL, truoc: TEN_LEVEL[LO_TRINH[i - 1]] || LO_TRINH[i - 1] };
}
function capSau_(q, lop, i) {
  const base = String(q.id).trim(), chu = find_('HocSinh', 'id', base);
  if (!chu) return q.action === 'kid' ? { ok: true, kid: null } : { ok: false, err: 'Không có mã con này' };
  if (chu.obj.lop !== LO_TRINH[0]) return handleCore_(q);   // mã cấp riêng cho level này (nếu có) hoặc sai level: chạy như cũ
  if (!String(chu.obj.goi || '').trim()) return { ok: false, err: TEN_LEVEL[lop] + ' mở bằng mã khoá học CES cấp, sau khi con học xong ' + TEN_LEVEL[LO_TRINH[i - 1]] + '.' };
  if (q.action === 'dangnhap') {   // PIN, máy: ghi ở dòng mã gốc
    const r = handleCore_(Object.assign({}, q, { lop: chu.obj.lop }));
    return r && r.ok ? Object.assign(r, { cap: capInfo_(chu, lop, i) }) : r;
  }
  const g = kidGate_(q, chu); if (g) return g;   // PIN, máy, hạn dùng theo mã gốc
  const cap = capInfo_(chu, lop, i);
  if (!cap.mo) {
    if (q.action === 'kid') return { ok: true, kid: Object.assign(kidOut_(chu.obj), { lop }), cap, awards: [], orders: [] };
    return { ok: false, khoa_cap: true, cap, err: 'Con học xong ' + cap.truoc + ' (' + cap.ngay + '/' + cap.can + ' ngày) thì ' + TEN_LEVEL[lop] + ' mới mở.' };
  }
  const did = base + '.' + lop;
  if (!find_('HocSinh', 'id', did)) add_('HocSinh', { lop, id: did, ten: chu.obj.ten, tao: new Date(), web: 0, vi: 0, ngay: 0, cuoi: '', luu_cuoi: '', nguon: 'lo_trinh', ghi_chu_ban: 'Mã khoá học ' + base });
  const r = handleCore_(Object.assign({}, q, { id: did }));
  if (r && r.ok && q.action === 'kid' && r.kid) {
    const c = kidOut_(chu.obj); r.kid = Object.assign(r.kid, { id: base, pin: c.pin, goi: c.goi, so_thang: c.so_thang, kich: c.kich, han: c.han }); r.cap = cap;
  }
  return r;
}
function handleCore_(q) {
  const lop = String(q.lop || '').trim();
  const pinOk = () => { const p = pinOf_(lop); return !!p && String(q.pin || '').trim() === p; };
  /* web tự học: lệnh qt_* của trang quản trị dùng phiên đăng nhập tài khoản riêng (q.tk), không dùng PIN lớp */
  const QT = String(q.action || '').indexOf('qt_') === 0, ME = QT ? qtPhien_(q.tk) : null;
  const needPin = () => QT ? (ME ? (lop && !LOP_MAC_DINH.some(x => x[0] === lop) ? { ok: false, err: 'Thiếu mã level' } : null) : { ok: false, dn: true, err: 'Phiên đăng nhập đã hết. Đăng nhập lại nhé.' })
    : (pinOk() ? null : { ok: false, err: lop ? 'Sai mã PIN' : 'Thiếu mã lớp' });
  const qa = handleQT_(q, lop, ME); if (qa) return qa;   // lệnh riêng của web tự học (tài khoản, mã kích hoạt)

  switch (q.action) {
    case 'ping': return { ok: true, v: 6, tu_hoc: 1 };

    /* ---------- Góc vinh danh (công khai) ---------- */
    case 'video': {
      const cfg = rows_('CaiDat').find(x => x.lop === lop); if (!cfg) return { ok: false, err: 'Thiếu mã lớp' };
      const cache = CacheService.getScriptCache(), ck = 'vd_' + lop + '_' + String(cfg.video_folder || '');
      if (q.moi !== '1') { const c = cache.get(ck); if (c) return JSON.parse(c); }
      const out = { ok: true, start: ngay_(cfg.khai_giang), items: cfg.video_folder ? videos_(String(cfg.video_folder).trim()) : [] };
      try { cache.put(ck, JSON.stringify(out), VIDEO_CACHE_GIAY); } catch (x) {}
      return out;
    }

    /* ---------- web của con ---------- */
    /* ---------- bản 5: nhập PIN ở máy mới, Bảng của con (con và ba mẹ cùng xem) ---------- */
    case 'dangnhap': {
      const k = find_('HocSinh', 'id', q.id); if (!k) return { ok: false, err: 'Không có mã con này' };
      const sai = saiLevel_(k, lop); if (sai) return sai;
      const pin = String(k.obj.pin_con || '').trim(); if (!pin) return { ok: true, free: true };
      const dev = String(q.dev || '').slice(0, 40); if (dev.length < 8) return { ok: false, err: 'Máy này chưa có mã nhận diện. Mở lại trang rồi thử lại.' };
      const may = parseJ_(k.obj.may); if (may.some(m => m.d === dev)) return kichHoat_(k) || { ok: true, han: hanCua_(k.obj) };
      const cache = CacheService.getScriptCache(), key = 'sai_' + k.obj.id, fails = +cache.get(key) || 0;
      if (fails >= KHOA_SAI) return { ok: false, khoa: true, err: 'Nhập sai nhiều lần rồi. Chờ ' + KHOA_PHUT + ' phút nhé, hoặc nhờ cô giúp.' };
      if (String(q.pin || '').trim() !== pin) {
        cache.put(key, String(fails + 1), KHOA_PHUT * 60); const con = KHOA_SAI - fails - 1;
        return { ok: false, sai: true, con, khoa: con <= 0, err: con > 0 ? 'Chưa đúng rồi, con thử lại nhé.' : 'Nhập sai nhiều lần rồi. Chờ ' + KHOA_PHUT + ' phút nhé, hoặc nhờ cô giúp.' };
      }
      cache.remove(key);
      const het = kichHoat_(k); if (het) return het;   // đúng PIN: lần đầu thì bắt đầu tính hạn; hết hạn thì báo
      const m = { d: dev, at: Date.now(), ua: String(q.ua || '').slice(0, 30) };
      if (may.length < maxMay_(k.obj.lop)) { may.push(m); set_('HocSinh', k.row, { may: JSON.stringify(may), cho_may: JSON.stringify(parseJ_(k.obj.cho_may).filter(x => x.d !== dev)) }); return { ok: true, moi: true, han: hanCua_(k.obj) }; }
      const cho = parseJ_(k.obj.cho_may); if (!cho.some(x => x.d === dev)) { cho.push(m); set_('HocSinh', k.row, { cho_may: JSON.stringify(cho.slice(-6)) }); }
      return { ok: false, need: 'duyet', ten: k.obj.ten };
    }
    case 'ten': {   // bản 6: con chưa có PIN đăng nhập bằng họ tên (web chỉ mở Unit 1 cho kiểu đăng nhập này)
      if (!LOP_MAC_DINH.some(x => x[0] === lop)) return { ok: false, err: 'Thiếu mã lớp' };
      if (lop !== LO_TRINH[0]) return { ok: false, err: TEN_LEVEL[lop] + ' mở bằng mã khoá học sau khi con học xong ' + TEN_LEVEL[LO_TRINH[0]] + '. Con bắt đầu từ ' + TEN_LEVEL[LO_TRINH[0]] + ' nhé.' };
      const ten = tenSach_(q.ten); if (ten.length < 3 || ten.split(' ').length < 2) return { ok: false, err: 'Con nhập cả họ và tên nhé, ví dụ: Nguyễn Minh An.' };
      const a = tenSo_(ten), b = boDau_(a), all = rows_('HocSinh').filter(k => k.lop === lop && k.trang_thai !== 'nghi');
      const exact = all.filter(k => tenSo_(k.ten) === a), gan = exact.length ? [] : all.filter(k => boDau_(tenSo_(k.ten)) === b);
      const tim = (exact.length ? exact : gan).slice(0, 5).map(k => ({ id: String(k.id), ten: String(k.ten), pin: !!String(k.pin_con || '').trim() }));
      if (q.tao !== '1' || exact.length || (gan.length && q.ep !== '1')) return { ok: true, tim, dung: exact.length > 0 };
      if (all.filter(k => k.nguon === 'tu_nhap').length >= 80) return { ok: false, err: 'Lớp đã có nhiều tên tự nhập. Ba mẹ liên hệ CES giúp con nhé.' };
      let id; do { id = newId_(''); } while (find_('HocSinh', 'id', id));
      add_('HocSinh', { lop, id, ten, tao: new Date(), web: 0, vi: 0, ngay: 0, cuoi: '', luu_cuoi: '', nguon: 'tu_nhap' });
      return { ok: true, moi: true, id, ten };
    }
    case 'bang': {   // báo cáo chung cho con và ba mẹ: chỉ số liệu của chính con + nhận xét cô chọn chia sẻ
      const k = find_('HocSinh', 'id', q.id); if (!k) return { ok: false, err: 'Không có mã con này' };
      const g = kidGate_(q, k); if (g) return g;
      const id = String(k.obj.id), lopK = k.obj.lop, cfg = rows_('CaiDat').find(x => x.lop === lopK) || {};
      const bl = rows_('BuoiLop').filter(r => r.lop === lopK), ngayBuoi = {}; bl.forEach(r => { ngayBuoi[+r.buoi] = ngay_(r.ngay); });
      return { ok: true, ten: k.obj.ten, lop: lopK, web: +k.obj.web || 0, ngay: +k.obj.ngay || 0, cuoi: String(k.obj.cuoi || ''), khai_giang: ngay_(cfg.khai_giang),
        sao_co: rows_('Thuong').filter(a => a.kid === id && !truthy_(a.huy)).reduce((t, a) => t + (+a.n || 0), 0),
        da_day: bl.filter(r => truthy_(r.da_day)).map(r => +r.buoi).sort((a, b) => a - b),
        buoi: rows_('BuoiHS').filter(r => r.kid === id).map(r => { const o = hsOut_(r); delete o.note; o.ngay = ngayBuoi[o.buoi] || ''; return o; }).sort((a, b) => a.buoi - b.buoi),
        gc: rows_('GhiChu').filter(r => r.kid === id && !truthy_(r.xoa) && truthy_(r.chia_se)).reverse().slice(0, 30).map(gcOut_) };
    }

    case 'kid': {
      const k = find_('HocSinh', 'id', q.id);
      const sai = k && saiLevel_(k, lop); if (sai) return sai;
      const g = k && kidGate_(q, k); if (g) return g;
      return { ok: true, kid: k ? kidOut_(k.obj) : null,
        awards: rows_('Thuong').filter(a => a.kid === String(q.id) && !truthy_(a.huy)).map(awardOut_),
        orders: rows_('DoiQua').filter(o => o.kid === String(q.id)).map(orderOut_) };
    }
    case 'hello': {
      const k = find_('HocSinh', 'id', q.id); if (!k) return { ok: false, err: 'Không có mã con này' };
      const g = kidGate_(q, k); if (g) return g;
      set_('HocSinh', k.row, { web: +q.web || 0, vi: +q.vi || 0, ngay: +q.ngay || 0, cuoi: String(q.cuoi || '') });
      return { ok: true };
    }
    case 'redeem': {
      const k = find_('HocSinh', 'id', q.id); if (!k) return { ok: false, err: 'Không có mã con này' };
      const g = kidGate_(q, k); if (g) return g;
      if (!find_('DoiQua', 'code', q.code)) add_('DoiQua', { code: String(q.code), lop: k.obj.lop, kid: String(q.id), ten: k.obj.ten,
        qua: q.qua || '', ten_qua: q.ten_qua || '', sao: +q.sao || 0, at: new Date(), st: 'cho', note: '' });
      return { ok: true };
    }
    case 'tai': {   // lấy bản tiến độ đầy đủ của con
      const k = find_('HocSinh', 'id', q.id); if (!k) return { ok: false, err: 'Không có mã con này' };
      const g = kidGate_(q, k); if (g) return g;
      const t = find_('TienDo', 'id', q.id);
      return { ok: true, v: t ? +t.obj.v || 0 : 0, t: t ? +t.obj.t || 0 : 0, data: t ? readData_(t.obj) : '' };
    }
    case 'luu': {   // lưu bản tiến độ; base phải trùng phiên bản đang có, nếu không trả bản mới hơn để web gộp rồi gửi lại
      const k = find_('HocSinh', 'id', q.id); if (!k) return { ok: false, err: 'Không có mã con này' };
      const g = kidGate_(q, k); if (g) return g;
      const data = typeof q.data === 'string' ? q.data : JSON.stringify(q.data || {});
      if (data.length > MAX_DATA) return { ok: false, err: 'Tiến độ quá lớn để lưu' };
      const t = find_('TienDo', 'id', q.id), cur = t ? +t.obj.v || 0 : 0;
      if ((+q.base || 0) !== cur) return { ok: false, xung: true, v: cur, t: t ? +t.obj.t || 0 : 0, data: t ? readData_(t.obj) : '' };
      const o = { lop: k.obj.lop, id: String(q.id), v: cur + 1, t: +q.t || Date.now(), capnhat: new Date(), do_dai: data.length };
      for (let i = 0; i < 6; i++) o['d' + (i + 1)] = data.slice(i * CHUNK, (i + 1) * CHUNK);
      if (t) set_('TienDo', t.row, o); else add_('TienDo', o);
      set_('HocSinh', k.row, { luu_cuoi: new Date() });
      return { ok: true, v: cur + 1 };
    }

    /* ---------- Bảng của cô (PIN theo lớp) ---------- */
    case 'cls': {
      const bad = needPin(); if (bad) return bad;
      const kids = rows_('HocSinh').filter(k => k.lop === lop), ids = new Set(kids.map(k => k.id));
      return { ok: true, kids: kids.map(kidOut_),
        awards: rows_('Thuong').filter(a => ids.has(a.kid)).reverse().slice(0, 300).map(awardOut_),
        orders: rows_('DoiQua').filter(o => ids.has(o.kid)).reverse().map(orderOut_) };
    }
    case 'award': {
      const bad = needPin(); if (bad) return bad;
      const ids = String(q.ids || '').split(',').filter(Boolean), mine = new Set(rows_('HocSinh').filter(k => k.lop === lop).map(k => k.id));
      let n = 0; ids.forEach(id => { if (!mine.has(id)) return; add_('Thuong', { id: newId_('A'), lop, kid: id, n: +q.n || 1, why: String(q.why || '').slice(0, 120), at: new Date(), huy: '' }); n++; });
      return { ok: true, n };
    }
    case 'unaward': {
      const bad = needPin(); if (bad) return bad;
      const a = find_('Thuong', 'id', q.aid); if (a && a.obj.lop === lop) set_('Thuong', a.row, { huy: 'x' });
      return { ok: true };
    }
    case 'order': {
      const bad = needPin(); if (bad) return bad;
      const o = find_('DoiQua', 'code', q.code); if (o && o.obj.lop === lop) set_('DoiQua', o.row, { st: String(q.st || ''), note: String(q.note || '') });
      return { ok: true };
    }
    case 'addkid': {
      const bad = needPin(); if (bad) return bad;
      const ten = String(q.ten || '').trim().slice(0, 40) || 'Bạn mới';
      let id; do { id = newId_(''); } while (find_('HocSinh', 'id', id));
      add_('HocSinh', { lop, id, ten, tao: new Date(), web: 0, vi: 0, ngay: 0, cuoi: '', luu_cuoi: '' });
      return { ok: true, id };
    }

    /* ---------- Trang quản trị giáo viên (PIN theo lớp; web gọi bằng POST để PIN không nằm trên đường link) ---------- */
    case 'qt_tai': {   // một lần tải đủ dữ liệu cho cả trang quản trị
      const bad = needPin(); if (bad) return bad;
      const cfg = rows_('CaiDat').find(x => x.lop === lop) || {};
      const kids = rows_('HocSinh').filter(k => k.lop === lop), ids = new Set(kids.map(k => k.id));
      return { ok: true, v: 5, cfg: { ten_lop: cfg.ten_lop || '', khai_giang: ngay_(cfg.khai_giang) },
        kids: kids.map(k => Object.assign((QT ? kidOutQT_ : kidOut_)(k), { pin: String(k.pin_con || ''), may: parseJ_(k.may), cho: parseJ_(k.cho_may) })), max_may: maxMay_(lop),
        awards: rows_('Thuong').filter(a => ids.has(a.kid)).reverse().slice(0, 400).map(awardOut_),
        orders: rows_('DoiQua').filter(o => ids.has(o.kid)).reverse().map(orderOut_),
        hs: rows_('BuoiHS').filter(r => r.lop === lop).map(hsOut_),
        bl: rows_('BuoiLop').filter(r => r.lop === lop).map(blOut_),
        gc: rows_('GhiChu').filter(r => r.lop === lop && !truthy_(r.xoa)).reverse().slice(0, 1500).map(gcOut_),
        tn: rows_('TaiNguyen').filter(r => r.lop === lop).sort((a, b) => (+a.thu_tu || 0) - (+b.thu_tu || 0)).map(tnOut_) };
    }
    case 'qt_buoi': {   // lưu một buổi: thông tin buổi + điểm danh/ghi nhận từng con
      const bad = needPin(); if (bad) return bad;
      const b = Math.round(+q.buoi); if (!(b >= 0 && b <= 60)) return { ok: false, err: 'Số buổi không hợp lệ' };
      const mine = new Set(rows_('HocSinh').filter(k => k.lop === lop).map(k => k.id)), now = new Date();
      upsertMany_('BuoiLop', [{ k: lop + '|' + b, lop, buoi: b, ngay: ngay_(q.ngay), da_day: truthy_(q.da_day) ? 1 : '', ghi_chu: String(q.ghi_chu || '').slice(0, 600), at: now }]);
      let rows = q.rows; if (typeof rows === 'string') { try { rows = JSON.parse(rows); } catch (x) { rows = []; } }
      const lv = x => (x === '' || x == null) ? '' : Math.max(0, Math.min(3, Math.round(+x) || 0));
      const list = (rows || []).filter(r => mine.has(String(r.kid))).map(r => ({ k: lop + '|' + b + '|' + r.kid, lop, buoi: b, kid: String(r.kid),
        cm: ['c', 'v', 'p', 't'].includes(r.cm) ? r.cm : '', tg: lv(r.tg), en: lv(r.en), zh: lv(r.zh), bt: lv(r.bt), note: String(r.note || '').slice(0, 300), at: now }));
      upsertMany_('BuoiHS', list);
      return { ok: true, n: list.length };
    }
    case 'qt_gc_them': {
      const bad = needPin(); if (bad) return bad;
      const k = find_('HocSinh', 'id', q.kid); if (!k || k.obj.lop !== lop) return { ok: false, err: 'Không có con này trong lớp' };
      const nd = String(q.noi_dung || '').trim().slice(0, 800); if (!nd) return { ok: false, err: 'Chưa có nội dung' };
      const o = { id: newId_('N'), lop, kid: String(q.kid), buoi: q.buoi === '' || q.buoi == null ? '' : Math.round(+q.buoi), loai: LOAI_GHI.includes(q.loai) ? q.loai : 'khac', noi_dung: nd, at: new Date(), xoa: '', chia_se: (q.chia_se === '1' || q.chia_se === 1 || q.chia_se === true) ? 'x' : '' };
      add_('GhiChu', o); return { ok: true, note: gcOut_(o) };
    }
    case 'qt_gc_xoa': {
      const bad = needPin(); if (bad) return bad;
      const g = find_('GhiChu', 'id', q.id); if (g && g.obj.lop === lop) set_('GhiChu', g.row, { xoa: 'x' });
      return { ok: true };
    }
    case 'qt_hs': {   // sửa tên, đánh dấu nghỉ học / đang học
      const bad = needPin(); if (bad) return bad;
      const k = find_('HocSinh', 'id', q.id); if (!k || k.obj.lop !== lop) return { ok: false, err: 'Không có con này trong lớp' };
      const o = {}; if (q.ten != null && String(q.ten).trim()) o.ten = String(q.ten).trim().slice(0, 40);
      if (q.tt != null) o.trang_thai = q.tt === 'nghi' ? 'nghi' : '';
      set_('HocSinh', k.row, o); return { ok: true };
    }
    case 'qt_lop': {   // ngày khai giảng của lớp
      const bad = needPin(); if (bad) return bad;
      const c = find_('CaiDat', 'lop', lop); if (!c) return { ok: false, err: 'Thiếu mã lớp' };
      set_('CaiDat', c.row, { khai_giang: String(q.khai_giang || '') }); CacheService.getScriptCache().remove('vd_' + lop + '_' + String(c.obj.video_folder || ''));
      return { ok: true };
    }
    /* ---------- bản 5: tài khoản các con (PIN, máy, chia sẻ ghi chú) ---------- */
    case 'qt_kids_them': {   // dán danh sách tên → tạo hàng loạt, mỗi con một mã và một PIN 4 số
      const bad = needPin(); if (bad) return bad;
      let names = q.ten; if (typeof names === 'string') { try { names = JSON.parse(names); } catch (x) { names = names.split('\n'); } }
      names = (names || []).map(x => String(x).trim().slice(0, 40)).filter(Boolean).slice(0, 60);
      const have = new Set(rows_('HocSinh').map(x => x.id)), out = [];
      names.forEach(ten => { let id; do { id = newId_(''); } while (have.has(id)); have.add(id); const pin = newPin_();
        add_('HocSinh', { lop, id, ten, tao: new Date(), web: 0, vi: 0, ngay: 0, cuoi: '', luu_cuoi: '', pin_con: pin, may: '', cho_may: '' }); out.push({ id, ten, pin }); });
      return { ok: true, kids: out };
    }
    case 'qt_pin': {   // mode: moi = PIN mới (xoá hết máy đã nhớ), tat = bỏ PIN. ids: danh sách mã, hoặc tat_ca=1 cho mọi con chưa có PIN
      const bad = needPin(); if (bad) return bad;
      const mine = rows_('HocSinh').filter(x => x.lop === lop); let ids = String(q.ids || q.id || '').split(',').filter(Boolean);
      if (q.tat_ca === '1' || q.tat_ca === 1) ids = mine.filter(x => !String(x.pin_con || '').trim()).map(x => x.id);
      const out = [];
      ids.forEach(id => { const k = find_('HocSinh', 'id', id); if (!k || k.obj.lop !== lop) return;
        const pin = q.mode === 'tat' ? '' : newPin_(); set_('HocSinh', k.row, { pin_con: pin, may: '', cho_may: '' }); out.push({ id, ten: k.obj.ten, pin }); });
      return { ok: true, kids: out };
    }
    case 'qt_may': {   // act: duyet (máy chờ → máy được dùng), tu_choi (bỏ máy chờ), go (gỡ máy đã nhớ)
      const bad = needPin(); if (bad) return bad;
      const k = find_('HocSinh', 'id', q.id); if (!k || k.obj.lop !== lop) return { ok: false, err: 'Không có con này trong lớp' };
      let may = parseJ_(k.obj.may), cho = parseJ_(k.obj.cho_may); const dev = String(q.dev || '');
      if (q.act === 'duyet') { const m = cho.find(x => x.d === dev); if (m && !may.some(x => x.d === dev)) may.push(m); cho = cho.filter(x => x.d !== dev); }
      else if (q.act === 'tu_choi') cho = cho.filter(x => x.d !== dev);
      else if (q.act === 'go') may = may.filter(x => x.d !== dev);
      else return { ok: false, err: 'Lệnh không rõ' };
      set_('HocSinh', k.row, { may: JSON.stringify(may), cho_may: JSON.stringify(cho) }); return { ok: true, may, cho };
    }
    case 'qt_gc_chia': {   // bật/tắt chia sẻ một ghi chú với con và ba mẹ
      const bad = needPin(); if (bad) return bad;
      const g = find_('GhiChu', 'id', q.id); if (!g || g.obj.lop !== lop) return { ok: false, err: 'Không có ghi chú này' };
      set_('GhiChu', g.row, { chia_se: (q.v === '1' || q.v === 1 || q.v === true) ? 'x' : '' }); return { ok: true };
    }

    case 'qt_tn_luu': {   // thêm hoặc sửa một link tài nguyên
      const bad = needPin(); if (bad) return bad;
      const url = String(q.url || '').trim(); if (!/^https?:\/\//i.test(url)) return { ok: false, err: 'Link phải bắt đầu bằng https://' };
      const o = { lop, nhom: String(q.nhom || 'Khác').slice(0, 40), ten: String(q.ten || url).slice(0, 100), url: url.slice(0, 600), ghi_chu: String(q.ghi_chu || '').slice(0, 200), thu_tu: +q.thu_tu || 0 };
      const cur = q.id ? find_('TaiNguyen', 'id', q.id) : null;
      if (cur && cur.obj.lop === lop) { set_('TaiNguyen', cur.row, o); return { ok: true, id: String(q.id) }; }
      o.id = newId_('T'); add_('TaiNguyen', o); return { ok: true, id: o.id };
    }
    case 'qt_tn_xoa': {
      const bad = needPin(); if (bad) return bad;
      const t = find_('TaiNguyen', 'id', q.id); if (t && t.obj.lop === lop) sh_('TaiNguyen').deleteRow(t.row);
      return { ok: true };
    }
  }
  return { ok: false, err: 'Lệnh không rõ' };
}

/* ===================== cài đặt lần đầu (chị chạy hàm này 1 lần trong trình soạn Apps Script) ===================== */
function caiDat() {
  Object.keys(TAB).forEach(name => sh_(name));
  const cd = sh_('CaiDat'), have = rows_('CaiDat').map(r => r.lop);
  LOP_MAC_DINH.forEach(([lop, ten]) => { if (!have.includes(lop)) add_('CaiDat', { lop, ten_lop: ten, pin: String(100000 + Math.floor(Math.random() * 900000)), ghi_chu: 'Cô có thể sửa PIN ở ô này' }); });
  cd.autoResizeColumns(1, 4);
  const ma = maThietLap_();
  Logger.log('Xong. Mã thiết lập tài khoản Quản lý đầu tiên: ' + ma + ' (cũng nằm ở tab CaiDatQT). PIN Bảng của cô: ' + rows_('CaiDat').map(r => r.ten_lop + ' = ' + r.pin).join(' · '));
}

/* ===================== Góc vinh danh ===================== */
/* Đọc video trong thư mục của lớp (và một tầng thư mục con, nếu cô muốn chia theo tuần).
   Tên tệp: "Bông – đọc truyện Unit 2.mp4"; có thể thêm mã con trong ngoặc vuông: "Bông [ZTK2A7] – đọc truyện.mp4". */
function videos_(folderId) {
  const out = [], seen = {};
  const scan = (f, depth) => {
    const it = f.getFiles();
    while (it.hasNext() && out.length < 600) {
      const x = it.next(), mt = String(x.getMimeType() || '');
      if (!/^video\//.test(mt) || seen[x.getId()] || x.isTrashed()) continue; seen[x.getId()] = 1;
      const raw = String(x.getName() || '').replace(/\.[A-Za-z0-9]{2,4}$/, '');
      const m = raw.match(/\[([A-Za-z0-9]{4,8})\]/), kid = m ? m[1].toUpperCase() : '';
      const clean = raw.replace(/\s*\[[A-Za-z0-9]{4,8}\]\s*/, ' ').replace(/\s+/g, ' ').trim();
      const parts = clean.split(/\s+[–—-]\s+|_/);
      out.push({ id: x.getId(), ten: (parts[0] || '').trim(), bai: parts.slice(1).join(' – ').trim(), kid, t: x.getDateCreated().getTime() });
    }
    if (depth < 1) { const sub = f.getFolders(); while (sub.hasNext()) scan(sub.next(), depth + 1); }
  };
  scan(DriveApp.getFolderById(folderId), 0);
  return out.sort((a, b) => b.t - a.t);
}
/* ngày khai giảng → "yyyy-mm-dd" (web tự tính tuần theo giờ trên máy con). Nhận ô ngày, "2026-11-16" hoặc "16/11/2026" */
function ngay_(v) {
  if (v === '' || v == null) return '';
  if (typeof v === 'number') return Utilities.formatDate(new Date(v), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  const s = String(v).trim(), p2 = n => ('0' + n).slice(-2); let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return m[1] + '-' + p2(m[2]) + '-' + p2(m[3]);
  if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) return m[3] + '-' + p2(m[2]) + '-' + p2(m[1]);
  return '';
}
/* Chị chạy hàm này một lần trong trình soạn Apps Script để cấp quyền đọc Drive và xem máy chủ thấy bao nhiêu video */
function thuVideo() {
  rows_('CaiDat').forEach(r => {
    if (!r.video_folder) return Logger.log(r.ten_lop + ': chưa có thư mục video');
    const v = videos_(String(r.video_folder).trim());
    Logger.log(r.ten_lop + ': ' + v.length + ' video' + (v[0] ? ' · mới nhất: ' + v[0].ten + ' – ' + v[0].bai : ''));
  });
}

/* ===================== trang quản trị: tiện ích ===================== */
/* ghi nhiều dòng một lượt theo cột khoá k (có thì sửa, chưa có thì thêm) */
function upsertMany_(name, list) {
  if (!list.length) return;
  const s = sh_(name), h = head_(s), tx = TEXT_COLS[name] || [], kc = h.indexOf('k'), n = Math.max(0, s.getLastRow() - 1);
  const v = n ? s.getRange(2, 1, n, h.length).getValues() : [], idx = {}; v.forEach((r, i) => { idx[String(r[kc])] = i; });
  const cell = (c, x) => x === undefined ? '' : (tx.includes(c) ? String(x) : x), add = [];
  list.forEach(o => { const i = idx[o.k];
    if (i === undefined) add.push(o); else h.forEach((c, j) => { if (o[c] !== undefined) v[i][j] = cell(c, o[c]); }); });
  if (v.length) s.getRange(2, 1, v.length, h.length).setValues(v);
  if (add.length) { const st = s.getLastRow() + 1;
    h.forEach((c, j) => { if (tx.includes(c)) s.getRange(st, j + 1, add.length, 1).setNumberFormat('@'); });
    s.getRange(st, 1, add.length, h.length).setValues(add.map(o => h.map(c => cell(c, o[c])))); }
}
function hsOut_(r) { return { buoi: +r.buoi, kid: r.kid, cm: r.cm || '', tg: r.tg === '' ? '' : +r.tg, en: r.en === '' ? '' : +r.en, zh: r.zh === '' ? '' : +r.zh, bt: r.bt === '' ? '' : +r.bt, note: r.note || '' }; }
function blOut_(r) { return { buoi: +r.buoi, ngay: ngay_(r.ngay), da_day: truthy_(r.da_day), ghi_chu: r.ghi_chu || '' }; }
function gcOut_(r) { return { id: String(r.id), kid: r.kid, buoi: r.buoi === '' ? '' : +r.buoi, loai: r.loai || 'khac', nd: r.noi_dung || '', at: +r.at || 0, cs: truthy_(r.chia_se) }; }
function tnOut_(r) { return { id: String(r.id), nhom: r.nhom || 'Khác', ten: r.ten || '', url: r.url || '', ghi_chu: r.ghi_chu || '', thu_tu: +r.thu_tu || 0 }; }

/* Chị chạy hàm này MỘT lần sau khi dán bản 4: tạo các tab mới và nạp sẵn vài link (Sheet quản lý, thư mục video vinh danh) vào tab TaiNguyen.
   Link nằm trong Sheet của chị, không nằm trên GitHub công khai. */
function caiDatQuanTri() {
  Object.keys(TAB).forEach(name => sh_(name));
  const have = rows_('TaiNguyen'), url = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  rows_('CaiDat').forEach((c, i) => {
    const has = u => have.some(r => r.lop === c.lop && r.url === u);
    if (!has(url)) add_('TaiNguyen', { id: newId_('T'), lop: c.lop, nhom: 'Quản lý lớp', ten: 'Google Sheet quản lý học sinh và tiến độ', url, ghi_chu: 'Chứa PIN: chỉ chia sẻ cho người cụ thể', thu_tu: 1 });
    if (c.video_folder) { const u = 'https://drive.google.com/drive/folders/' + String(c.video_folder).trim();
      if (!has(u)) add_('TaiNguyen', { id: newId_('T'), lop: c.lop, nhom: 'Quản lý lớp', ten: 'Thư mục video vinh danh', url: u, ghi_chu: 'Thả video con làm tốt vào đây', thu_tu: 2 }); }
  });
  Logger.log('Xong. Mở link /exec thấy "v":4 là máy chủ đã chạy bản mới.');
}

/* ===================== bản 5: PIN con, giới hạn máy ===================== */
const MAX_MAY_MAC_DINH = 2;   // mỗi con nhớ tối đa 2 máy; máy thứ 3 trở đi chờ cô duyệt (đổi ở tab CaiDat, cột max_may)
const KHOA_SAI = 5, KHOA_PHUT = 10;   // nhập sai PIN 5 lần thì khoá con đó 10 phút
function parseJ_(s) { try { const a = JSON.parse(String(s || '[]')); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function maxMay_(lop) { const c = rows_('CaiDat').find(x => x.lop === lop), n = c ? Math.round(+c.max_may) : 0; return n >= 1 && n <= 6 ? n : MAX_MAY_MAC_DINH; }
function newPin_() { let p; do { p = ''; for (let i = 0; i < 4; i++) p += Math.floor(Math.random() * 10); } while (/^(\d)\1{3}$/.test(p) || ['1234', '4321', '0123', '1230'].includes(p)); return p; }
/* Con CHƯA có PIN: vào như cũ. Con ĐÃ có PIN: chỉ máy đã được nhớ mới đọc/ghi được. */
function kidGate_(q, k) {
  if (!String(k.obj.pin_con || '').trim()) return null;
  const dev = String(q.dev || '').slice(0, 40);
  if (dev) {
    if (parseJ_(k.obj.may).some(m => m.d === dev)) return hetHan_(k.obj);
    if (parseJ_(k.obj.cho_may).some(m => m.d === dev)) return { ok: false, need: 'duyet', ten: k.obj.ten };
  }
  return { ok: false, need: 'pin', ten: k.obj.ten };
}

/* ===================== tiện ích Sheet ===================== */
const SH_ = {};   // nhớ tab đã kiểm trong một lượt gọi
function sh_(name) {
  if (SH_[name]) return SH_[name];
  const ss = SpreadsheetApp.getActiveSpreadsheet(); let s = ss.getSheetByName(name);
  if (!s) s = ss.insertSheet(name);
  const head = TAB[name], cur = s.getLastColumn() ? s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String) : [];
  const miss = head.filter(h => !cur.includes(h));
  if (!cur.filter(Boolean).length) {
    s.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#FFF4CC'); s.setFrozenRows(1);
  } else if (miss.length) {
    s.getRange(1, cur.length + 1, 1, miss.length).setValues([miss]).setFontWeight('bold').setBackground('#FFF4CC');
  }
  if (!cur.filter(Boolean).length || miss.length) {
    const hh = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String);
    (TEXT_COLS[name] || []).forEach(c => { const j = hh.indexOf(c); if (j >= 0) s.getRange(2, j + 1, Math.max(1, s.getMaxRows() - 1), 1).setNumberFormat('@'); });
  }
  return (SH_[name] = s);
}
function head_(s) { return s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String); }
function rows_(name) {
  const s = sh_(name), v = s.getDataRange().getValues(), h = v[0].map(String);
  return v.slice(1).filter(r => r.some(x => x !== '')).map(r => { const o = {}; h.forEach((k, j) => o[k] = norm_(k, r[j])); return o; });
}
function find_(name, key, val) {
  const s = sh_(name), v = s.getDataRange().getValues(), h = v[0].map(String), c = h.indexOf(key);
  for (let i = 1; i < v.length; i++) if (String(v[i][c]) === String(val)) { const o = {}; h.forEach((k, j) => o[k] = norm_(k, v[i][j])); return { row: i + 1, obj: o }; }
  return null;
}
/* cột chữ (mã con, ngày "2026-11-10"…) đặt định dạng văn bản trước khi ghi để Sheet không tự đổi thành số hay ngày */
function add_(name, o) {
  const s = sh_(name), h = head_(s), row = s.getLastRow() + 1, tx = TEXT_COLS[name] || [];
  h.forEach((k, j) => { if (tx.includes(k)) s.getRange(row, j + 1).setNumberFormat('@'); });
  s.getRange(row, 1, 1, h.length).setValues([h.map(k => o[k] === undefined ? '' : (tx.includes(k) ? String(o[k]) : o[k]))]);
}
function set_(name, row, o) {
  const s = sh_(name), h = head_(s), tx = TEXT_COLS[name] || [];
  Object.keys(o).forEach(k => { const c = h.indexOf(k); if (c < 0) return; const r = s.getRange(row, c + 1);
    if (tx.includes(k)) r.setNumberFormat('@').setValue(String(o[k])); else r.setValue(o[k]); });
}
function norm_(k, x) {
  if (x instanceof Date) return x.getTime();
  if (['id', 'kid', 'lop', 'code', 'pin', 'ten', 'cuoi', 'video_folder', 'pin_con', 'may', 'cho_may', 'goi', 'sdt', 'user', 'muoi', 'hash', 'khoa', 'gia_tri'].includes(k)) return String(x);
  return x;
}
function pinOf_(lop) { const r = rows_('CaiDat').find(x => x.lop === lop); return r ? String(r.pin).trim() : ''; }
function readData_(o) { let s = ''; for (let i = 1; i <= 6; i++) s += String(o['d' + i] || ''); return s; }
/* kidOut_: bản AN TOÀN, dùng cho web của con và bảng cô theo PIN. Không có SĐT, tên ba mẹ, năm sinh, trình độ, ghi chú bán hàng. */
function kidOut_(k) { return { id: k.id, lop: k.lop, ten: k.ten, tao: k.tao, web: +k.web || 0, vi: +k.vi || 0, ngay: +k.ngay || 0, cuoi: String(k.cuoi || ''), luu: k.luu_cuoi || '', tt: k.trang_thai || '', nguon: k.nguon || '', pin: !!String(k.pin_con || '').trim(),
  goi: String(k.goi || ''), so_thang: +k.so_thang || 0, kich: +k.kich_hoat || 0, han: hanCua_(k), mo_sd: truthy_(k.mo_sd) }; }
/* kidOutQT_: chỉ cho tài khoản quản trị đã đăng nhập (Quản lý và Nhân viên đều xem được thông tin liên hệ). */
function kidOutQT_(k) { return Object.assign(kidOut_(k), { sdt: String(k.sdt || ''), gcb: String(k.ghi_chu_ban || ''), cap: String(k.nguoi_cap || ''), cap_luc: +k.cap_luc || 0,
  ns: String(k.nam_sinh || ''), ph: String(k.phu_huynh || ''), tda: String(k.trinh_do_anh || ''), tdt: String(k.trinh_do_trung || '') }); }
function namSinh_(v) { const n = parseInt(String(v == null ? '' : v).replace(/\D/g, '').slice(0, 4), 10); return n >= 1990 && n <= new Date().getFullYear() ? String(n) : ''; }
function chuTuDo_(v, n) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n); }
function awardOut_(a) { return { id: String(a.id), kid: a.kid, n: +a.n || 0, why: a.why || '', at: +a.at || 0, huy: truthy_(a.huy) }; }
function orderOut_(o) { return { code: o.code, kid: o.kid, ten: o.ten, qua: o.qua, ten_qua: o.ten_qua, sao: +o.sao || 0, at: +o.at || 0, st: o.st, note: o.note || '' }; }
/* họ tên: bỏ khoảng trắng thừa, viết hoa chữ đầu mỗi tiếng; so khớp không phân biệt hoa thường, có lần so thêm khi bỏ dấu */
function tenSach_(t) { return String(t || '').normalize('NFC').replace(/[^\p{L}\p{M} '\-()]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 40).split(' ').map(w => w.toLowerCase().replace(/^(\(?)(\p{L})/u, (m, a, b) => a + b.toUpperCase())).join(' '); }
function tenSo_(t) { return String(t || '').normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim(); }
function boDau_(t) { return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd'); }
function newId_(p) { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = p || ''; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
function truthy_(x) { return x !== '' && x !== false && x !== 0 && x != null; }

/* =====================================================================
   WEB TỰ HỌC · GÓI, HẠN DÙNG, TÀI KHOẢN QUẢN TRỊ (21/11/2026)
   ===================================================================== */
const TEN_LEVEL = { ls: 'Little Seed', sd: 'Seedling' };
function themThang_(t, n) { const d = new Date(+t); d.setMonth(d.getMonth() + n); return d.getTime(); }
/* hạn dùng của một mã: 0 = trọn đời hoặc chưa kích hoạt / chưa có gói; còn lại là mốc hết hạn (ms) */
function hanCua_(k) {
  if (String(k.goi || '') === 'tron_doi' || !(+k.so_thang > 0) || !(+k.kich_hoat > 0)) return 0;
  return themThang_(+k.kich_hoat, +k.so_thang);
}
function ngayVN_(t) { return t ? Utilities.formatDate(new Date(+t), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : ''; }
function hetHan_(k) {
  if (!String(k.goi || '').trim()) return null;   // mã không bán theo gói (vd. tên tự nhập): không có hạn
  const h = hanCua_(k);
  return h && Date.now() > h ? { ok: false, het: true, han: h, ten: k.ten, err: 'Mã của con đã hết hạn ngày ' + ngayVN_(h) + '. Ba mẹ liên hệ CES (0974.840.845) để gia hạn nhé.' } : null;
}
/* đăng nhập đúng PIN lần đầu: bắt đầu tính hạn từ hôm nay */
function kichHoat_(k) {
  if (String(k.obj.goi || '').trim() && !(+k.obj.kich_hoat > 0)) {
    const now = Date.now(); k.obj.kich_hoat = now;
    set_('HocSinh', k.row, { kich_hoat: new Date(now), het_han: hanCua_(k.obj) ? new Date(hanCua_(k.obj)) : (k.obj.goi === 'tron_doi' ? 'Trọn đời' : '') });
  }
  return hetHan_(k.obj);
}
function saiLevel_(k, lop) {
  if (!lop || !k.obj.lop || k.obj.lop === lop) return null;
  return { ok: false, err: 'Mã này dùng cho web ' + (TEN_LEVEL[k.obj.lop] || k.obj.lop) + ', không dùng cho web ' + (TEN_LEVEL[lop] || lop) + '. Ba mẹ mở đúng web của con nhé.' };
}

/* ---------- mật khẩu, phiên ---------- */
function bam_(mk, muoi) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, muoi + '|' + mk, Utilities.Charset.UTF_8).map(b => ('0' + (b & 255).toString(16)).slice(-2)).join(''); }
function muoi_() { return Utilities.getUuid().replace(/-/g, '').slice(0, 16); }
function mkTam_() { const A = 'abcdefghjkmnpqrstuvwxyz23456789'; let s = ''; for (let i = 0; i < 8; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
function qtPhien_(tk) {
  tk = String(tk || ''); if (tk.length < 20) return null;
  const v = CacheService.getScriptCache().get('qtp_' + tk); if (!v) return null;
  const s = JSON.parse(v), t = find_('QuanTriVien', 'user', s.user);
  if (!t || !truthy_(t.obj.hoat_dong) || String(t.obj.hash).slice(0, 12) !== s.h) return null;
  return { user: t.obj.user, ten: t.obj.ten, vai: t.obj.vai_tro, ql: t.obj.vai_tro === 'Quản lý', row: t.row, doiMk: truthy_(t.obj.doi_mk) };
}
function taoPhien_(t) {
  const tk = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
  CacheService.getScriptCache().put('qtp_' + tk, JSON.stringify({ user: t.user, h: String(t.hash).slice(0, 12) }), PHIEN_GIO * 3600);
  return tk;
}
function maThietLap_() {
  const r = rows_('CaiDatQT').find(x => x.khoa === 'ma_thiet_lap');
  if (r) return String(r.gia_tri);
  const m = String(100000 + Math.floor(Math.random() * 900000));
  add_('CaiDatQT', { khoa: 'ma_thiet_lap', gia_tri: m, ghi_chu: 'Mã để tạo tài khoản Quản lý đầu tiên trên trang quản trị. Tạo xong có thể xoá dòng này.' });
  return m;
}
function ghiNhatKy_(me, viec, lop, ma, chiTiet) { add_('NhatKyQT', { at: new Date(), user: me ? me.user : '', ten: me ? me.ten : '', viec, lop: lop || '', ma: ma || '', chi_tiet: String(chiTiet || '').slice(0, 500) }); }
function mkHopLe_(mk) { mk = String(mk || ''); return mk.length >= 8 && /[a-zA-Z]/.test(mk) && /\d/.test(mk); }

/* ---------- lệnh của web tự học (trả null nếu không phải lệnh của phần này) ---------- */
function handleQT_(q, lop, ME) {
  const a = q.action;
  if (a === 'qt_trangthai') { const ds = rows_('QuanTriVien'); return { ok: true, coTaiKhoan: ds.some(t => truthy_(t.hoat_dong) && t.hash) }; }
  if (a === 'qt_thietlap') {   // tạo tài khoản Quản lý đầu tiên bằng mã ở tab CaiDatQT
    if (rows_('QuanTriVien').some(t => truthy_(t.hoat_dong) && t.hash)) return { ok: false, err: 'Đã có tài khoản. Đăng nhập, hoặc nhờ Quản lý tạo tài khoản cho bạn.' };
    if (String(q.ma || '').trim() !== maThietLap_()) return { ok: false, err: 'Mã thiết lập chưa đúng (xem tab CaiDatQT của Sheet).' };
    const user = String(q.user || '').trim().toLowerCase(); if (!/^[a-z0-9._@-]{3,40}$/.test(user)) return { ok: false, err: 'Tên đăng nhập 3–40 ký tự: chữ không dấu, số, dấu chấm.' };
    if (!mkHopLe_(q.mk)) return { ok: false, err: 'Mật khẩu ít nhất 8 ký tự, có cả chữ và số.' };
    const muoi = muoi_(), t = { user, ten: String(q.ten || user).slice(0, 40), vai_tro: 'Quản lý', muoi, hash: bam_(q.mk, muoi), hoat_dong: true, tao: new Date(), cuoi_vao: new Date(), doi_mk: '' };
    add_('QuanTriVien', t); ghiNhatKy_({ user, ten: t.ten }, 'Tạo tài khoản Quản lý đầu tiên', '', '', '');
    return { ok: true, tk: taoPhien_(t), me: { user, ten: t.ten, vai: 'Quản lý', ql: true } };
  }
  if (a === 'qt_dangnhap') {
    const user = String(q.user || '').trim().toLowerCase(), cache = CacheService.getScriptCache(), key = 'qts_' + user, sai = +cache.get(key) || 0;
    if (sai >= 6) return { ok: false, err: 'Sai nhiều lần. Chờ 15 phút rồi thử lại.' };
    const t = find_('QuanTriVien', 'user', user);
    if (!t || !truthy_(t.obj.hoat_dong) || !t.obj.hash || bam_(String(q.mk || ''), t.obj.muoi) !== t.obj.hash) { cache.put(key, String(sai + 1), 900); return { ok: false, err: 'Tên đăng nhập hoặc mật khẩu chưa đúng.' }; }
    cache.remove(key); set_('QuanTriVien', t.row, { cuoi_vao: new Date() });
    return { ok: true, tk: taoPhien_(t.obj), me: { user: t.obj.user, ten: t.obj.ten, vai: t.obj.vai_tro, ql: t.obj.vai_tro === 'Quản lý', doiMk: truthy_(t.obj.doi_mk) } };
  }
  if (a.indexOf('qt_') !== 0) return null;
  if (!ME) return null;   // lệnh qt_ khác: để handle_ trả lỗi phiên
  switch (a) {
    case 'qt_toi': return { ok: true, me: { user: ME.user, ten: ME.ten, vai: ME.vai, ql: ME.ql, doiMk: ME.doiMk } };
    case 'qt_doimk': {
      const t = find_('QuanTriVien', 'user', ME.user);
      if (bam_(String(q.cu || ''), t.obj.muoi) !== t.obj.hash) return { ok: false, err: 'Mật khẩu cũ chưa đúng.' };
      if (!mkHopLe_(q.moi)) return { ok: false, err: 'Mật khẩu mới ít nhất 8 ký tự, có cả chữ và số.' };
      const muoi = muoi_(), hash = bam_(q.moi, muoi); set_('QuanTriVien', t.row, { muoi, hash, doi_mk: '' });
      ghiNhatKy_(ME, 'Đổi mật khẩu', '', '', ''); return { ok: true, tk: taoPhien_({ user: ME.user, hash }) };
    }
    case 'qt_tk_ds': {
      if (!ME.ql) return { ok: false, err: 'Chỉ Quản lý xem được danh sách tài khoản.' };
      return { ok: true, ds: rows_('QuanTriVien').map(t => ({ user: t.user, ten: t.ten, vai: t.vai_tro, on: truthy_(t.hoat_dong), cuoi: +t.cuoi_vao || 0, doiMk: truthy_(t.doi_mk) })),
        nk: rows_('NhatKyQT').slice(-300).reverse().map(r => ({ at: +r.at || 0, ten: r.ten || r.user, viec: r.viec, lop: r.lop, ma: r.ma, ct: r.chi_tiet })) };
    }
    case 'qt_tk_luu': {   // tạo mới (trả mật khẩu tạm) hoặc sửa tên, vai trò, khoá/mở, cấp lại mật khẩu
      if (!ME.ql) return { ok: false, err: 'Chỉ Quản lý tạo hoặc sửa tài khoản.' };
      const user = String(q.user || '').trim().toLowerCase(); if (!/^[a-z0-9._@-]{3,40}$/.test(user)) return { ok: false, err: 'Tên đăng nhập 3–40 ký tự: chữ không dấu, số, dấu chấm.' };
      const vai = VAI_TRO.includes(q.vai) ? q.vai : 'Nhân viên', t = find_('QuanTriVien', 'user', user);
      if (user === ME.user && (vai !== 'Quản lý' || q.on === false || q.on === '0')) return { ok: false, err: 'Bạn không tự hạ vai trò hoặc tự khoá tài khoản của mình được.' };
      let mk = '';
      if (!t) { mk = mkTam_(); const muoi = muoi_();
        add_('QuanTriVien', { user, ten: String(q.ten || user).slice(0, 40), vai_tro: vai, muoi, hash: bam_(mk, muoi), hoat_dong: true, tao: new Date(), cuoi_vao: '', doi_mk: 'x' });
        ghiNhatKy_(ME, 'Tạo tài khoản ' + vai, '', user, q.ten || '');
      } else {
        const o = { ten: String(q.ten || t.obj.ten).slice(0, 40), vai_tro: vai, hoat_dong: !(q.on === false || q.on === '0') };
        if (q.capLai) { mk = mkTam_(); o.muoi = muoi_(); o.hash = bam_(mk, o.muoi); o.doi_mk = 'x'; }
        set_('QuanTriVien', t.row, o); ghiNhatKy_(ME, 'Sửa tài khoản' + (q.capLai ? ' (cấp lại mật khẩu)' : ''), '', user, vai + (o.hoat_dong ? '' : ' · khoá'));
      }
      return { ok: true, mk };
    }
    case 'qt_ma_tao': {   // cấp mã khoá học: ds = [{ten, sdt}] (tối đa 60), gói. Mã luôn ở level đầu (Little Seed), dùng tiếp cho Seedling
      lop = LO_TRINH[0];
      if (!GOI[q.goi]) return { ok: false, err: 'Chọn gói' };
      let ds = q.ds; if (typeof ds === 'string') { try { ds = JSON.parse(ds); } catch (x) { ds = []; } }
      ds = (ds || []).map(x => ({ ten: String(x.ten || '').trim().slice(0, 40), sdt: String(x.sdt || '').replace(/[^\d+]/g, '').slice(0, 15), ns: namSinh_(x.ns), ph: chuTuDo_(x.ph, 60), tda: chuTuDo_(x.tda, 100), tdt: chuTuDo_(x.tdt, 100) })).filter(x => x.ten).slice(0, 60);
      if (!ds.length) return { ok: false, err: 'Nhập ít nhất một tên con.' };
      const have = new Set(rows_('HocSinh').map(x => x.id)), out = [];
      ds.forEach(x => { let id; do { id = newId_(''); } while (have.has(id)); have.add(id); const pin = newPin_();
        add_('HocSinh', { lop, id, ten: x.ten, tao: new Date(), web: 0, vi: 0, ngay: 0, cuoi: '', luu_cuoi: '', pin_con: pin, may: '', cho_may: '', nguon: 'ban_goi',
          goi: q.goi, so_thang: GOI[q.goi][0], kich_hoat: '', het_han: q.goi === 'tron_doi' ? 'Trọn đời' : '', sdt: x.sdt, ghi_chu_ban: String(q.gc || '').slice(0, 200), nguoi_cap: ME.ten, cap_luc: new Date(), nam_sinh: x.ns, phu_huynh: x.ph, trinh_do_anh: x.tda, trinh_do_trung: x.tdt });
        out.push({ id, ten: x.ten, pin, sdt: x.sdt });
        ghiNhatKy_(ME, 'Cấp mã ' + GOI[q.goi][1], lop, id, x.ten + (x.sdt ? ' · ' + x.sdt : '')); });
      return { ok: true, kids: out, goi: GOI[q.goi][1] };
    }
    case 'qt_giahan': {
      const k = find_('HocSinh', 'id', q.id); if (!k || !String(k.obj.goi || '').trim()) return { ok: false, err: 'Không có mã khoá học này' };
      lop = k.obj.lop;
      if (!GOI[q.goi]) return { ok: false, err: 'Chọn gói gia hạn' };
      const o = {}, cu = k.obj, n = GOI[q.goi][0];
      if (q.goi === 'tron_doi' || cu.goi === 'tron_doi') { o.goi = 'tron_doi'; o.so_thang = 0; o.het_han = 'Trọn đời'; }
      else {
        const h = hanCua_(cu);
        if (!(+cu.kich_hoat > 0)) { o.so_thang = (+cu.so_thang || 0) + n; o.goi = q.goi; }              // chưa kích hoạt: cộng dồn
        else if (h && Date.now() > h) { o.kich_hoat = new Date(); o.so_thang = n; o.goi = q.goi; }     // đã hết hạn: tính lại từ hôm nay
        else { o.so_thang = (+cu.so_thang || 0) + n; o.goi = q.goi; }                                  // còn hạn: nối tiếp
        const tam = Object.assign({}, cu, { so_thang: o.so_thang, goi: o.goi, kich_hoat: o.kich_hoat ? o.kich_hoat.getTime() : cu.kich_hoat });
        o.het_han = hanCua_(tam) ? new Date(hanCua_(tam)) : '';
      }
      set_('HocSinh', k.row, o);
      const moi = Object.assign({}, cu, o, { kich_hoat: o.kich_hoat ? o.kich_hoat.getTime() : cu.kich_hoat, so_thang: o.so_thang });
      ghiNhatKy_(ME, 'Gia hạn ' + GOI[q.goi][1], lop, cu.id, cu.ten + ' → ' + (hanCua_(moi) ? 'hết hạn ' + ngayVN_(hanCua_(moi)) : (moi.goi === 'tron_doi' ? 'trọn đời' : 'tính hạn từ lần đăng nhập đầu')));
      return { ok: true, kid: kidOutQT_(moi) };
    }
    case 'qt_ma_sua': {
      const k = find_('HocSinh', 'id', q.id); if (!k || !String(k.obj.goi || '').trim()) return { ok: false, err: 'Không có mã khoá học này' };
      lop = k.obj.lop; const o = {}; if (q.ten != null && String(q.ten).trim()) o.ten = String(q.ten).trim().slice(0, 40);
      if (q.sdt != null) o.sdt = String(q.sdt).replace(/[^\d+]/g, '').slice(0, 15);
      if (q.gc != null) o.ghi_chu_ban = String(q.gc).slice(0, 200);
      if (q.ns != null) o.nam_sinh = namSinh_(q.ns);
      if (q.ph != null) o.phu_huynh = chuTuDo_(q.ph, 60);
      if (q.tda != null) o.trinh_do_anh = chuTuDo_(q.tda, 100);
      if (q.tdt != null) o.trinh_do_trung = chuTuDo_(q.tdt, 100);
      set_('HocSinh', k.row, o); ghiNhatKy_(ME, 'Sửa thông tin mã', lop, k.obj.id, Object.keys(o).join(', ')); return { ok: true, kid: kidOutQT_(Object.assign({}, k.obj, o)) };
    }
  }
  return null;
}
