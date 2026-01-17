# RealEstate Pro Dashboard

Nền tảng SaaS quản lý bất động sản dành cho môi giới và đại lý. CRM chuyên nghiệp với quản lý tài sản, khách hàng tiềm năng, tài chính, và cộng tác nhóm.

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS, Recharts, Framer Motion |
| Backend | Next.js API Routes, Prisma ORM 7.2 |
| Database | PostgreSQL (Neon Serverless) |
| Auth | JWT + bcryptjs |
| Payments | Stripe |
| Email | Resend (fallback: Gmail SMTP) |
| Testing | Playwright |

## Tính năng chính

### Quản lý tài sản
- CRUD bất động sản với thông số chi tiết (phòng ngủ, phòng tắm, diện tích, giá, cap rate, NOI)
- Loại: Residential, Commercial, Luxury, Vacation, Investment
- Trạng thái bảo trì, tình trạng thuê, hình ảnh và tài liệu

### Quản lý khách hàng tiềm năng
- Pipeline: New → Contacted → Qualified → Showing → Negotiating → Closed
- Mức độ ưu tiên: Low, Medium, High, Urgent
- Lead scoring AI với ML prediction
- Lịch follow-up và nhắc nhở

### Tài chính
- Theo dõi giao dịch: Thu nhập, Chi phí, Hoa hồng
- Phân tích doanh thu theo tháng
- Quản lý settlement và escrow

### Marketplace
- Mua/bán lead giữa các đại lý
- Phí nền tảng 10-30%
- Theo dõi giao dịch và hoàn tiền

### Team Collaboration
- Tạo nhóm, mời thành viên
- Phân quyền: Owner, Admin, Member, Viewer

### Email Marketing
- Template: Welcome, Follow-up, Property Alert, Newsletter
- Campaign với targeting và analytics

## Gói subscription

| Gói | Giá | Tài sản | Leads | Email/tháng |
|-----|-----|---------|-------|-------------|
| Free | $0 | 5 | 20 | 50 |
| Starter | $29 | 25 | 100 | 500 |
| Professional | $79 | 100 | 500 | 2500 |
| Enterprise | $199 | Unlimited | Unlimited | Unlimited |

## Cài đặt

```bash
# Clone và install
npm install

# Setup database
npm run db:push
npm run db:seed

# Chạy dev server
npm run dev
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-32-char-secret
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev          # Dev với Turbopack
npm run build        # Production build
npm run db:studio    # Visual DB editor
npm run test         # Playwright tests
```

## Cấu trúc thư mục

```
app/
├── api/              # 33 API endpoints
├── page.tsx          # Dashboard chính
└── login/            # Auth pages

components/
├── dashboard/tabs/   # 9 tab panels
├── dashboard/modals/ # Dialog components
└── auth/             # Auth forms

lib/
├── auth/             # JWT & session
├── stripe.ts         # Payments
├── email.ts          # Email service
└── prisma.ts         # Database client

prisma/
└── schema.prisma     # 31 models, 48 enums
```

## Database Models

- **User**: Agents/brokers với license tracking
- **Property**: Listings với investment metrics
- **Lead**: CRM với scoring và pipeline
- **Transaction**: Financial records
- **Settlement**: Deal closings và disbursements
- **Subscription**: Stripe billing
- **Team**: Collaboration groups
- **LeadListing**: Marketplace items
- **EmailCampaign**: Marketing automation

## License

Private - All rights reserved
