/* ===== Cấu hình sản phẩm — chỉnh ở đây, không cần sửa mã khác =====
   Xem ADMIN.md để biết cách bật thanh toán, cấp Pro thủ công và cấu hình Supabase. */
var APP_CFG={
  brand:'Golf Academy',
  tagline:{vi:'Học viện golf trong túi bạn',en:'Your pocket golf academy'},
  version:'4.0',

  /* Máy chủ dữ liệu (publishable key là khóa công khai) */
  supabase:{url:'https://pzojrhwtoxwcsrkucwti.supabase.co',key:'sb_publishable_TWvl8ePnnfWRdEUSE3f2Kg_dZOHRpIC'},

  /* Gói Pro */
  paywall:true,              /* false = mở khóa mọi nội dung (chế độ thử nghiệm / trước khi bán) */
  trialDays:14,              /* dùng thử Pro miễn phí cho người mới */
  freeVideoPerMonth:3,       /* số lần phân tích video miễn phí mỗi tháng */
  price:{
    vi:{month:'149.000đ',year:'1.190.000đ',yearPerMonth:'≈ 99.000đ/tháng',save:'Tiết kiệm 33%'},
    en:{month:'$7.99',year:'$59.99',yearPerMonth:'≈ $5.00/month',save:'Save 37%'}
  },
  /* Link thanh toán quốc tế (Lemon Squeezy / Stripe Payment Link). Để trống = ẩn nút.
     Ứng dụng tự nối ?checkout[custom][user_id]=… và email để máy chủ biết ai đã trả tiền. */
  checkout:{monthly:'',yearly:''},
  /* Chuyển khoản trong nước qua VietQR. Để trống bin/account = ẩn.
     bin: mã ngân hàng (vd 970436 = Vietcombank), account: số tài khoản, name: tên chủ TK (không dấu). */
  bank:{bin:'',account:'',name:'',month:149000,year:1190000},
  support:'',                /* email hỗ trợ hiển thị ở trang Pro & điều khoản */
  owner:{vi:'Chủ sở hữu ứng dụng',en:'The app owner'}
};
