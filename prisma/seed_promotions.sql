
INSERT INTO promotions (
  id, code, title, description, "imageUrl",
  "discountType", "discountValue",
  "minOrderValue", "maxDiscount",
  "startDate", "endDate",
  "usageLimit", "maxUsagePerUser",
  status, "createdOn"
)
VALUES
  (
    'clpromo000001',
    'SUMMER100',
    'Mùa hè rực rỡ',
    'Tận hưởng kỳ nghỉ hè tuyệt vời với mã giảm 100k trực tiếp vào tổng phòng.',
    'http://localhost:9000/images/promotions/summer100.png',
    'FIXED', 100000,
    1000000, NULL,
    '2026-01-01', '2026-12-31',
    NULL, 1,
    'ACT', NOW()
  ),
  (
    'clpromo000002',
    'SAVING200',
    'Hành trình tiết kiệm',
    'Đặt phòng ngay hôm nay, nhận ưu đãi 200k để chuyển đi thêm phần thoải mái.',
    'http://localhost:9000/images/promotions/saving200.png',
    'FIXED', 200000,
    1000000, NULL,
    '2026-01-01', '2026-12-31',
    NULL, 1,
    'ACT', NOW()
  ),
  (
    'clpromo000003',
    'VACATION300',
    'Kỳ nghỉ trọn vẹn',
    'Giảm ngay 300k cho mỗi lần đặt phòng, giúp bạn hưởng nhiều bữa ngon hơn.',
    'http://localhost:9000/images/promotions/vacation300.png',
    'FIXED', 300000,
    1000000, NULL,
    '2026-01-01', '2026-12-31',
    NULL, 1,
    'ACT', NOW()
  ),
  (
    'clpromo000004',
    'SUPER400',
    'Siêu ưu đãi',
    'Tiết kiệm ngay 400k, thoải mái khám phá khách sạn yêu thích mà không lo về giá.',
    'http://localhost:9000/images/promotions/super400.png',
    'FIXED', 400000,
    1000000, NULL,
    '2026-01-01', '2026-12-31',
    NULL, 1,
    'ACT', NOW()
  ),
  (
    'clpromo000005',
    'JOY5',
    'Niềm vui bất tận',
    'Giảm ngay 5% tổng giá trị đặt phòng, thêm ưu đãi cho những trải nghiệm thú vị.',
    'http://localhost:9000/images/promotions/joy5.png',
    'PERCENT', 5,
    NULL, 150000,
    '2026-01-01', '2026-12-31',
    NULL, 2,
    'ACT', NOW()
  ),
  (
    'clpromo000006',
    'ENJOY10',
    'Tận hưởng trọn vẹn',
    'Giảm ngay 10% cho tất cả các loại phòng, ưu đãi hấp dẫn đến bạn nghỉ dưỡng thoải mái hơn.',
    'http://localhost:9000/images/promotions/enjoy10.png',
    'PERCENT', 10,
    NULL, 300000,
    '2026-01-01', '2026-12-31',
    NULL, 1,
    'ACT', NOW()
  )
ON CONFLICT (code) DO NOTHING;
