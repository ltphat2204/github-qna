# GitHub Repository Q&A System

Hệ thống hỗ trợ truy vấn thông tin mã nguồn dựa trên kiến trúc Retrieval-Augmented Generation (RAG) và các mô hình ngôn ngữ lớn (LLM). Ứng dụng cung cấp khả năng phân tích và phản hồi các câu hỏi kỹ thuật liên quan đến nội dung của kho lưu trữ (repository) GitHub thông qua cơ chế tìm kiếm ngữ nghĩa và tóm tắt mã nguồn tự động.

## Kiến trúc hệ thống và Nguyên lý hoạt động

Hệ thống triển khai quy trình RAG (Retrieval-Augmented Generation) để tối ưu hóa việc cung cấp ngữ cảnh cho mô hình ngôn ngữ, bao gồm các giai đoạn chính sau:

1. **Trích xuất và Nạp dữ liệu (Data Ingestion):**
   * Sử dụng `GithubRepoLoader` từ thư viện **LangChain** để thực hiện thu thập dữ liệu cấu trúc tệp tin và nội dung mã nguồn từ GitHub thông qua API.

2. **Xử lý Tóm tắt và Nhúng Vector (Summarization & Vector Embedding):**
   * **Tóm tắt nội dung:** Sử dụng mô hình **Google Gemini 1.5 Flash** để phân tích và tóm tắt chức năng cốt lõi của từng tệp tin. Quy trình này giúp loại bỏ các thông tin dư thừa và tối ưu hóa giới hạn token khi thực hiện truy vấn.
   * **Vectorization:** Nội dung tóm tắt và mã nguồn được chuyển đổi thành các vector đặc trưng (embeddings) bằng mô hình **Google text-embedding-004**.
   * **Lưu trữ:** Các vector được lưu trữ và quản lý trong cơ sở dữ liệu PostgreSQL hỗ trợ tiện ích mở rộng `pgvector`, cho phép thực hiện các phép toán tìm kiếm không gian vector hiệu quả.

3. **Truy vấn và Tìm kiếm tương đồng (Retrieval):**
   * Khi nhận yêu cầu truy vấn, câu hỏi sẽ được chuyển đổi thành vector và so khớp với cơ sở dữ liệu để tìm ra các đoạn mã nguồn hoặc tệp tin có độ tương đồng ngữ nghĩa cao nhất.

4. **Tổng hợp và Phản hồi (Generation):**
   * Dữ liệu được tìm thấy cùng với câu hỏi ban đầu được đưa vào prompt thông qua **Vercel AI SDK**. LLM thực hiện phân tích ngữ cảnh thực tế của repository để đưa ra phản hồi chính xác về mặt kỹ thuật.

### Tính năng Phân tích Thay đổi (Commit Summarization)

Hệ thống tích hợp tính năng theo dõi các phiên bản chuyển giao (commits) thông qua GitHub REST API. Công nghệ LLM được sử dụng để phân tích dữ liệu `git diff`, từ đó tự động tạo ra các bản tóm tắt kỹ thuật về các thay đổi trong mã nguồn.

## Danh mục Công nghệ (Tech Stack)

* **Giao diện (Frontend):** Next.js (App Router), React, TailwindCSS, Radix UI.
* **Hệ thống Backend & Dữ liệu:** tRPC, Prisma ORM, PostgreSQL (pgvector).
* **AI & Machine Learning:**
  * **Google Gemini API:** Sử dụng cho các tác vụ Text Generation và Text Embedding.
  * **Vercel AI SDK:** Quản trị luồng streaming dữ liệu và tích hợp mô hình.
  * **LangChain:** Hỗ trợ các công cụ nạp và tiền xử lý tài liệu.
* **Xác thực và Bảo mật:** Clerk.
* **Tích hợp hệ thống:** Octokit (GitHub REST API).

## Hướng dẫn triển khai cục bộ (Local Development)

### 1. Cài đặt phụ thuộc
```bash
npm install
```

### 2. Cấu hình biến môi trường
Khởi tạo tệp `.env` dựa trên `.env.example` và thiết lập các thông số cấu hình sau:
* `DATABASE_URL`: URL kết nối PostgreSQL (yêu cầu hỗ trợ pgvector).
* `GEMINI_API_KEY`: Khóa API từ Google AI Studio.
* `GITHUB_TOKEN`: GitHub Personal Access Token.
* Các khóa cấu hình cho Clerk và các biến môi trường khác của Next.js.

### 3. Khởi tạo cơ sở dữ liệu
```bash
npm run db:push
npm run db:generate
```

### 4. Khởi chạy ứng dụng
```bash
npm run dev
```

Ứng dụng sẽ khả dụng mặc định tại `http://localhost:3000`.