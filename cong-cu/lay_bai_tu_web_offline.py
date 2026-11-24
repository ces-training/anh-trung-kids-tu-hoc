#!/usr/bin/env python3
"""Lấy bài học mới nhất của web lớp offline (Little Seed + Seedling) sang web tự học bán gói (24/11/2026).

    git clone --depth 1 https://github.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu /tmp/nguon
    git switch -c cap-nhat-bai-<ngày>
    python3 cong-cu/lay_bai_tu_web_offline.py /tmp/nguon --thu   # chỉ báo sẽ đổi gì, không ghi
    python3 cong-cu/lay_bai_tu_web_offline.py /tmp/nguon         # chép thật, rồi mở Pull Request

- Kho web lớp offline chỉ được ĐỌC: không sửa, không đẩy gì vào đó.
- Chép lại little-seed/, seedling/ (trừ cong-cu/), chung/ (trừ mo-unit-dau.js), tranh, giọng, thư viện dùng chung,
  rồi vá lại các điểm riêng của web tự học (BAN_VA dưới đây). Một bản vá không khớp → dừng, không ghi gì, báo để sửa bản vá.
- Giữ nguyên: chung/mo-unit-dau.js (khoá học nối tiếp, mã, hạn), dòng SDL_API đang nối máy chủ tự học,
  quan-tri/, apps-script/, index.html, cong-cu/.
"""
import filecmp, os, re, shutil, sys, tempfile

KHO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
THU_MUC = [('little-seed', {'cong-cu'}), ('seedling', {'cong-cu'}), ('chung', {'mo-unit-dau.js'}),
           ('xem-truoc/img', set()), ('xem-truoc/tai-nguyen', set()), ('chuong-trinh/ve48', set()), ('lop-zoom/vendor', set())]
SDL = re.compile(r"^const SDL_API = .*$", re.M)
# (tệp, chuỗi gốc, chuỗi thay, số lần phải gặp)
BAN_VA = [
    ('little-seed/index.html', '<link rel="stylesheet" href="vinh-danh.css">\n', '', 1),   # tắt Góc vinh danh video lớp offline
    ('little-seed/index.html', '<script src="ls-vinh-danh.js"></script>\n', '', 1),
    ('seedling/index.html', '<link rel="stylesheet" href="vinh-danh.css">\n', '', 1),
    ('seedling/index.html', '<script src="seedling-vinh-danh.js"></script>\n', '', 1),
    ('little-seed/ls-app.js', '<span class="h2-kick">Anh – Trung – Kids · lớp offline</span>', '<span class="h2-kick">Anh – Trung – Kids · khoá tự học · chặng 1</span>', 1),
    ('little-seed/ls-bai-moi.js', '<span class="h2-kick">Anh – Trung – Kids · lớp offline</span>', '<span class="h2-kick">Anh – Trung – Kids · khoá tự học · chặng 1</span>', 1),
    ('little-seed/ls-thuong.js', '🌰 Little Seed · lớp offline', '🌰 Little Seed · chặng 1', 1),
    ('seedling/seedling-app.js', '<span class="h2-kick">Anh – Trung – Kids · lớp offline</span>', '<span class="h2-kick">Anh – Trung – Kids · khoá tự học · chặng 2</span>', 1),
    ('seedling/seedling-bai-moi.js', '<span class="h2-kick">Anh – Trung – Kids · lớp offline</span>', '<span class="h2-kick">Anh – Trung – Kids · khoá tự học · chặng 2</span>', 1),
    ('seedling/seedling-thuong.js', '🌱 Seedling · lớp offline', '🌱 Seedling · chặng 2', 1),
]
MAY_CHU = ['little-seed/ls-may-chu.js', 'seedling/seedling-may-chu.js']


def chep_thu_muc(a, b, bo):
    os.makedirs(b, exist_ok=True)
    for x in os.listdir(a):
        if x in bo: continue
        p = os.path.join(a, x)
        (shutil.copytree if os.path.isdir(p) else shutil.copy2)(p, os.path.join(b, x))


def so_sanh(a, b, bo):
    moi, xoa = [], []
    for g, ds, fs in os.walk(a):
        if g == a: ds[:] = [d for d in ds if d not in bo]
        for f in fs:
            if g == a and f in bo: continue
            p = os.path.join(g, f); q = os.path.join(b, os.path.relpath(p, a))
            if not os.path.isfile(q) or not filecmp.cmp(p, q, shallow=False): moi.append(q)
    for g, ds, fs in os.walk(b):
        if g == b: ds[:] = [d for d in ds if d not in bo]
        for f in fs:
            if g == b and f in bo: continue
            q = os.path.join(g, f)
            if not os.path.exists(os.path.join(a, os.path.relpath(q, b))): xoa.append(q)
    return moi, xoa


def main():
    if len(sys.argv) < 2 or not os.path.isfile(os.path.join(sys.argv[1], 'little-seed', 'index.html')):
        sys.exit('Cần đường dẫn tới bản clone kho web lớp offline (có little-seed/index.html).')
    nguon, thu = os.path.abspath(sys.argv[1]), '--thu' in sys.argv
    giu = {f: SDL.search(open(os.path.join(KHO, f), encoding='utf-8').read()).group(0) for f in MAY_CHU}
    with tempfile.TemporaryDirectory() as tam:
        for d, bo in THU_MUC:
            if os.path.isdir(os.path.join(nguon, d)): chep_thu_muc(os.path.join(nguon, d), os.path.join(tam, d), bo)
        loi = []
        for f, a, b, n in BAN_VA:
            p = os.path.join(tam, f); s = open(p, encoding='utf-8').read()
            if s.count(a) != n: loi.append('%s: gặp %d lần (cần %d): %r' % (f, s.count(a), n, a[:60])); continue
            open(p, 'w', encoding='utf-8').write(s.replace(a, b))
        for f, dong in giu.items():
            p = os.path.join(tam, f); s = open(p, encoding='utf-8').read()
            if not SDL.search(s): loi.append(f + ': không thấy dòng SDL_API'); continue
            open(p, 'w', encoding='utf-8').write(SDL.sub(lambda m: dong, s, count=1))
        if loi:
            print('DỪNG, chưa ghi gì. Bản vá không khớp (web lớp offline vừa đổi chỗ này), sửa BAN_VA rồi chạy lại:'); [print('  -', x) for x in loi]; sys.exit(1)
        tong = [0, 0]
        for d, bo in THU_MUC:
            a, b = os.path.join(tam, d), os.path.join(KHO, d)
            if not os.path.isdir(a): continue
            moi, xoa = so_sanh(a, b, bo); tong[0] += len(moi); tong[1] += len(xoa)
            if moi or xoa: print('%-24s thêm/sửa %4d · xoá %4d' % (d, len(moi), len(xoa)))
            if thu: continue
            for q in xoa: os.remove(q)
            for q in moi:
                os.makedirs(os.path.dirname(q), exist_ok=True); shutil.copy2(os.path.join(a, os.path.relpath(q, b)), q)
        mu = os.path.join(nguon, 'chung', 'mo-unit-dau.js')
        print(('SẼ ĐỔI' if thu else 'ĐÃ ĐỔI'), tong[0], 'tệp, xoá', tong[1], 'tệp.')
        print('Lưu ý: chung/mo-unit-dau.js của web tự học là bản riêng (khoá học nối tiếp), không chép từ web lớp offline.'
              + (' Web lớp offline có tệp này: nếu bên đó vừa sửa phần đăng nhập, xem lại bằng tay.' if os.path.exists(mu) else ''))


if __name__ == '__main__':
    main()
