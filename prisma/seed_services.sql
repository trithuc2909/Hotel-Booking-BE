INSERT INTO service_categories (id, name, icon, status)
VALUES
  ('clscat000001', 'Di chuyển',            'car',       'ACT'),
  ('clscat000002', 'Trang trí nội thất',   'sparkles',  'ACT'),
  ('clscat000003', 'Thư giãn',             'heart',     'ACT'),
  ('clscat000004', 'Khám phá',             'map',       'ACT')
ON CONFLICT (name) DO NOTHING;

INSERT INTO services (
  id, "serviceCategoryId",
  name, description, "imageUrl",
  "basePrice", unit,
  status, "createdOn"
)
VALUES
  (
    'clsvc0000001', 'clscat000001',
    'Đưa đón sân bay (Airport Transfer)',
    'Khách sạn cung cấp xe riêng đưa đón khách giữa sân bay và khách sạn theo thời gian khách yêu cầu. Chi phí dịch vụ sẽ được cộng vào tổng hóa đơn khi khách sạn xác nhận thanh toán.',
    'http://localhost:9000/images/services/airport-transfer.png',
    400000, 'lượt', 'ACT', NOW()
  ),
  (
    'clsvc0000002', 'clscat000001',
    'Thuê xe máy (Motorbike Rental)',
    'Khách sạn cung cấp dịch vụ cho thuê xe máy để khách tự do khám phá và tham quan các địa điểm xung quanh trong thời gian lưu trú. Chi phí dịch vụ sẽ được cộng vào tổng hóa đơn khi khách sạn xác nhận thanh toán.',
    'http://localhost:9000/images/services/motorbike-rental.png',
    150000, 'ngày', 'ACT', NOW()
  ),
  (
    'clsvc0000003', 'clscat000002',
    'Trang trí sinh nhật (Room Birthday Decoration)',
    'Khách sạn cung cấp dịch vụ trang trí phòng với bóng bay, hoa, banner chúc mừng và các yếu tố khác không giới hạn theo yêu cầu và ngân sách cho dịp sinh nhật. Chi phí dịch vụ sẽ được cộng vào tổng hóa đơn khi khách sạn xác nhận thanh toán.',
    'http://localhost:9000/images/services/birthday-decoration.png',
    1200000, 'gói', 'ACT', NOW()
  ),
  (
    'clsvc0000004', 'clscat000002',
    'Trang trí cầu hôn (Romantic Proposal Decoration)',
    'Khách sạn cung cấp trang trí phòng không gian lãng mạn cho dịp cầu hôn với các yếu tố như hoa, nến, nhạc, bóng bay, chữ trang trí và các cách khác. Chi phí dịch vụ sẽ được cộng vào tổng hóa đơn khi khách sạn xác nhận thanh toán.',
    'http://localhost:9000/images/services/proposal-decoration.png',
    2500000, 'gói', 'ACT', NOW()
  ),
  (
    'clsvc0000005', 'clscat000003',
    'Massage toàn thân (Full Body Massage)',
    'Dịch vụ massage thư giãn giúp khách giải tỏa căng thẳng và phục hồi năng lượng sau chuyến đi. Massage đặc biệt từ thảo dược khám phá tinh hoa Đà Lạt.',
    'http://localhost:9000/images/services/massage.png',
    600000, 'người/60 phút', 'ACT', NOW()
  ),
  (
    'clsvc0000006', 'clscat000003',
    'Xông hơi thư giãn (Sauna / Steam Bath)',
    'Khách sạn có phòng xông hơi và tắm hơi để giúp khách thư giãn trong không gian yên tĩnh, thoải mái. Chi phí dịch vụ sẽ được cộng vào tổng hóa đơn khi khách sạn xác nhận thanh toán.',
    'http://localhost:9000/images/services/sauna.png',
    200000, 'người/lượt', 'ACT', NOW()
  ),
  (
    'clsvc0000007', 'clscat000004',
    'Dịch vụ Hướng dẫn viên du lịch (Tour Guide Service)',
    'Khách sạn có thể sắp xếp các tour có hướng dẫn viên địa phương dẫn khách tham quan các điểm du lịch nổi tiếng của Đà Lạt và các vùng lân cận. Chi phí dịch vụ sẽ được cộng vào tổng hóa đơn khi khách sạn xác nhận thanh toán.',
    'http://localhost:9000/images/services/tour-guide.png',
    500000, 'ngày', 'ACT', NOW()
  )
ON CONFLICT (name) DO NOTHING;
