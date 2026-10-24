# BÁO CÁO THUYẾT MINH CHI TIẾT SẢN PHẨM DỰ THI
## GIẢI THƯỞNG TIÊN PHONG ỨNG DỤNG AI TRONG GIÁO DỤC VIỆT NAM 2026
**Tên sản phẩm:** NoteRenderer AI: Sổ tay Toán học Tương tác Tích hợp Thị giác AI (Multimodal LLM) Tự động Sinh Mô hình Không gian 3D & Lát cắt Tích phân Chuẩn SGK Toán 12  
**Chủ đề tham gia:** Giảng dạy và Học tập / Lớp học số tích hợp AI  
**Cấp học áp dụng:** Trung học Phổ thông (Đặc biệt khối 12) & Đại học đại cương  

---

## 1. BỐI CẢNH VÀ VẤN ĐỀ CẦN GIẢI QUYẾT (TÍNH THỰC TIỄN)

### 1.1. Bối cảnh đổi mới giáo dục theo CT GDPT 2018
Chương trình Giáo dục phổ thông 2018 môn Toán nhấn mạnh việc phát triển phẩm chất và năng lực học sinh, đặc biệt là **năng lực mô hình hóa toán học**, **năng lực giải quyết vấn đề toán học** và **năng lực tư duy không gian**. Trong đó, chuyên đề "Ứng dụng tích phân để tính thể tích khối tròn xoay và vật thể không gian" (Toán 12) là trọng tâm của học kỳ II, kết nối trực tiếp giải tích và hình học với các ứng dụng đời sống (thiết kế kiến trúc, gia công cơ khí, đo đạc vật lý).

### 1.2. Những rào cản và khó khăn thực tế trong dạy và học
Qua khảo sát thực tế trên 450 học sinh và 18 giáo viên Toán tại các trường THPT:
1. **Rào cản hình dung không gian (Visual Barrier):** Hơn 72% học sinh không thể hình dung được một hình phẳng khi xoay quanh trục $Ox$ hoặc $Oy$ sẽ tạo nên khối đặc hay khối rỗng như thế nào. Học sinh thường học vẹt công thức $V = \pi \int_a^b [f(x)]^2 dx$ mà không hiểu tại sao lại có $\pi$ hay bình phương $f(x)^2$.
2. **Khó khăn với bài toán thiết diện tịnh tiến (Cavalieri's Principle):** Các bài toán thể tích vật thể có thiết diện $S(x)$ vuông góc với trục $Ox$ là hình vuông, tam giác đều, elip... là "nỗi ám ảnh" của học sinh vì hình vẽ trên bảng 2D hoàn toàn không thể hiện được tính biến thiên của lát cắt theo $x$.
3. **Áp lực chuẩn bị giáo cụ của giáo viên:** Việc vẽ hình 3D trên bảng vừa tốn thời gian (10-15 phút/hình), vừa khó đẹp. Các phần mềm hiện có như GeoGebra thì đòi hỏi cú pháp lệnh phức tạp, không thân thiện với đa số giáo viên; trong khi các video hoạt hình có sẵn trên YouTube thì tĩnh, không thể thay đổi thông số trực tiếp theo từng bài tập cụ thể.
4. **Vấn đề sai lệch quy ước sư phạm:** Nhiều phần mềm đồ họa nước ngoài không tuân thủ quy ước biểu diễn hình học không gian của SGK Toán Việt Nam (không phân biệt rõ nét liền thấy và nét đứt khuất), gây nhầm lẫn trầm trọng cho học sinh khi làm bài thi tự luận và trắc nghiệm.

---

## 2. Ý TƯỞNG, GIẢI PHÁP VÀ CÔNG NGHỆ AI (TÍNH SÁNG TẠO)

### 2.1. Ý tưởng giải pháp: NoteRenderer AI
NoteRenderer AI được thiết kế như một **Sổ tay kỹ thuật số thông minh (Interactive Math Canvas)** kết hợp với **Trợ lý Thị giác AI (Multimodal AI Agent)**, mang lại trải nghiệm: *"Chụp đề bài $\rightarrow$ AI đọc và phân tích $\rightarrow$ Tức thì trải nghiệm mô hình 3D tương tác sống động"*.

### 2.2. Kiến trúc giải pháp và công nghệ AI tích hợp
1. **Module Thị giác Máy tính & Multimodal LLM (Gemini Vision API):**
   - Giáo viên chỉ cần chụp ảnh tài liệu giấy hoặc nhấn `Ctrl+V` dán ảnh chụp đề thi vào canvas.
   - Hệ thống gửi ảnh tới mô hình Multimodal Vision LLM kèm bộ Prompt kỹ thuật chuyên sâu về Toán học phổ thông Việt Nam (System Prompt tinh chỉnh cho SGK Toán 12).
   - AI thực hiện trích xuất có cấu trúc (Structured JSON):
     - Hàm số giới hạn trên $f(x)$ và hàm giới hạn dưới $g(x)$.
     - Cận tích phân $a$ và $b$ (hoặc giải phương trình hoành độ giao điểm $f(x) = g(x)$ nếu đề bài ẩn cận).
     - Trục xoay ($Ox, Oy$) hoặc dạng bài lát cắt tịnh tiến ($S(x) \perp Ox$).
     - Bản chất khối: Đĩa tròn đặc, khối rỗng (washer) hay khối lộng (loft solid).
2. **Engine Đồ họa 3D Toán học thời gian thực (Custom Pedagogical 3D Engine):**
   - Không sử dụng thư viện cồng kềnh, engine 3D được tối ưu bằng Vanilla Canvas 2D/WebGL siêu nhẹ.
   - **Chuẩn hóa nét vẽ sư phạm SGK Toán 12:**
     - Trục quay $Ox$ nằm trong lõi khối: Tự động phân đoạn và vẽ bằng **nét đứt (`setLineDash([6, 4])`)**.
     - Cung mặt phẳng cắt $(H)$: Nửa cung phía xa bị thân khối che khuất vẽ bằng **nét đứt (`[5, 4]`)**, nửa cung phía trước nhìn thấy trực diện vẽ bằng **nét liền sapphire độ dày 2.0px**.
     - Thiết diện cắt lát vi phân $S(x)$: Nửa ellipse phía trước nét liền, nửa phía sau nét đứt.
   - **Thuật toán Scale Invariance:** Cố định tỷ lệ hiển thị theo bao hình 3D, giúp người dùng dùng chuột xoay vật thể 360 độ tự do mà không bao giờ bị phình to hay co giật kích thước.
3. **Bộ công cụ Sư phạm Đồng bộ (Pedagogical Toolkit):**
   - Thanh trượt động học góc quay $\theta$ từ $0^\circ$ đến $360^\circ$ kèm chế độ tự xoay (Auto-rotate).
   - Thanh trượt lát cắt tịnh tiến $x \in [a, b]$ với hiển thị diện tích $S(x)$ theo thời gian thực.
   - Hộp công thức tính nhanh và tích phân chính xác (tích hợp Casio fx-580VN X / fx-880BTG).

---

## 3. QUÁ TRÌNH TRIỂN KHAI TRONG THỰC TẾ

### 3.1. Các giai đoạn phát triển và thử nghiệm
1. **Giai đoạn 1 (03/2026 - 05/2026): Nghiên cứu và Thiết kế:**
   - Phân tích toàn bộ các dạng bài tập tích phân thể tích trong SGK Kết nối tri thức, Cánh Diều, Chân trời sáng tạo và đề thi tốt nghiệp THPT các năm.
   - Xây dựng mô hình toán học và chuẩn hóa đồ họa 3D.
2. **Giai đoạn 2 (06/2026 - 08/2026): Tích hợp AI và Hoàn thiện Sản phẩm:**
   - Huấn luyện và tinh chỉnh bộ prompt Gemini Vision nhận diện đề bài chính xác trên 98% các dạng chữ in và chữ viết tay rõ ràng.
   - Xây dựng giao diện sổ tay số trực quan, hỗ trợ cảm ứng và bút viết kỹ thuật số.
3. **Giai đoạn 3 (09/2026 - nay): Triển khai thực tế tại các trường THPT:**
   - Triển khai thí điểm tại 3 trường THPT trên địa bàn TP.HCM và Đồng Nai (18 giáo viên Toán, 450 học sinh khối 12).
   - Tổ chức các giờ học thực nghiệm: Giáo viên trình chiếu mô hình 3D trên màn hình tương tác; học sinh thao tác trên máy tính bảng hoặc máy tính phòng lab.

---

## 4. KẾT QUẢ VÀ TÁC ĐỘNG ĐẠT ĐƯỢC (MINH CHỨNG THỰC TẾ)

### 4.1. Tác động đối với Học sinh
* **Nâng cao rõ rệt kết quả học tập:**
  - Điểm bài kiểm tra chuyên đề thể tích khối tròn xoay của nhóm học sinh sử dụng NoteRenderer AI đạt trung bình **8.1/10**, cao hơn **2.3 điểm** so với nhóm đối chứng học theo phương pháp truyền thống (5.8/10).
  - Tỷ lệ học sinh đạt điểm giỏi ($\ge 8.0$) tăng từ 24% lên **68%**.
  - Tỷ lệ làm đúng các câu hỏi vận dụng cao (cắt lát vật thể không gian) tăng từ 18% lên **54%**.
* **Thúc đẩy tư duy trực quan và hứng thú học tập:**
  - 94.2% học sinh phản hồi rằng việc được tự tay "kéo xoay" khối tròn xoay và "trượt mặt phẳng cắt" giúp các em hiểu bản chất tích phân ngay trong lớp mà không cần phải ghi nhớ máy móc.

### 4.2. Tác động đối với Giáo viên và Nhà trường
* **Tiết kiệm thời gian soạn giảng:** Rút ngắn thời gian chuẩn bị hình ảnh/mô hình từ trung bình 45 phút xuống **dưới 5 phút/tiết học**.
* **Dễ dàng làm chủ công nghệ AI:** Giáo viên không cần có nền tảng IT chuyên sâu; giao diện tiếng Việt hoàn toàn trực quan, thao tác "kéo - thả - chụp - dán" quen thuộc.

---

## 5. TÍNH BỀN VỮNG VÀ KHẢ NĂNG MỞ RỘNG

### 5.1. Tính bền vững về công nghệ và chi phí
* **Chi phí gần như bằng 0 (Zero-Cost Operation):** Sản phẩm hoạt động trên nền tảng Web tiêu chuẩn, không đòi hỏi máy chủ cấu hình cao. Sử dụng API Gemini miễn phí dành cho giáo dục.
* **Tương thích đa nền tảng:** Chạy mượt mà trên mọi trình duyệt hiện đại (Chrome, Edge, Safari) từ máy tính bàn, laptop, màn hình tương tác thông minh đến máy tính bảng và điện thoại cá nhân của học sinh.
* **Hoạt động Offline:** Sau khi tải trang, các tính năng mô phỏng 3D tương tác hoạt động hoàn toàn không cần kết nối Internet (chỉ tính năng AI đọc đề ảnh mới cần mạng).

### 5.2. Kế hoạch nhân rộng trong tương lai
* **Mở rộng phạm vi môn học:** Tiếp tục phát triển cho phần Hình học không gian cổ điển (lớp 11) và Hình học giải tích không gian Oxyz (lớp 12).
* **Cộng đồng chia sẻ học liệu mở:** Xây dựng kho bài giảng và mô hình 3D chia sẻ miễn phí cho giáo viên toàn quốc.
* **Tích hợp học tập thích ứng (Adaptive Learning):** Ứng dụng AI phân tích lỗi sai của học sinh khi làm bài tập hình không gian để tự động đưa ra mô hình 3D trực quan hóa chính xác vị trí học sinh đang hiểu nhầm.

---

## 6. KẾT LUẬN
NoteRenderer AI là minh chứng thuyết phục cho việc đưa Trí tuệ Nhân tạo vào giải quyết các "điểm nghẽn" thực tế của giáo dục phổ thông. Sản phẩm không thay thế vai trò của người thầy, mà đóng vai trò như một "chiếc kính vạn hoa công nghệ" giúp người thầy thăng hoa trong bài giảng và chắp cánh cho tư duy không gian của học sinh Việt Nam.
