# Mini Task Manager - Backend

Backend API untuk aplikasi **Mini Task Manager** yang digunakan untuk mengelola task sederhana beserta riwayat perubahan status (audit log).

Project ini dibangun menggunakan **Node.js, Express, TypeScript, Prisma, dan PostgreSQL** dengan fokus pada kejelasan struktur kode, konsistensi, dan kemudahan pengembangan lebih lanjut.

---

## Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Prisma ORM
* Zod
* ts-node-dev
* CORS

---

## Struktur Folder

```text
src
├── config
├── controllers
├── middlewares
├── routes
├── services
├── utils
├── validations
├── generated
└── index.ts

prisma
├── migrations
├── schema.prisma
└── seed.ts
```

### Penjelasan Singkat

* **controllers** → menangani HTTP request dan response.
* **services** → berisi business logic dan interaksi database.
* **validations** → validasi request menggunakan Zod.
* **middlewares** → middleware validasi dan error handler.
* **routes** → definisi endpoint API.
* **config** → konfigurasi database Prisma.
* **utils** → helper seperti format response.

---

## Cara Menjalankan Backend

### 1. Clone Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Install Dependency

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env`

```env
DATABASE_URL="postgresql://username:password@localhost:5432/todo_db"
PORT=3000
```

### 4. Jalankan Migration

```bash
npx prisma migrate dev
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Jalankan Seeder

```bash
npm run seed
```

### 7. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan pada:

```text
http://localhost:3000
```

---

## Endpoint yang Telah Diimplementasikan

### Health Check

```http
GET /api/health
```

### Users

```http
GET    /api/users
GET    /api/users?all=true
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### Projects

```http
GET    /api/projects
GET    /api/projects?all=true
GET    /api/projects/:id
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

---

## Arsitektur

Project menggunakan pendekatan layered architecture sederhana.

```text
Request
↓
Route
↓
Controller
↓
Service
↓
Prisma ORM
↓
PostgreSQL
```

### Alasan

* Controller fokus pada HTTP concern.
* Service fokus pada business logic.
* Prisma menjadi satu-satunya akses ke database.
* Mempermudah maintenance dan pengembangan fitur baru.

---

## Asumsi yang Diambil

Beberapa asumsi yang digunakan dalam implementasi:

1. Tidak terdapat sistem autentikasi maupun otorisasi.
2. User digunakan sebagai predefined actor untuk kebutuhan audit log.
3. Project hanya berfungsi sebagai grouping task.
4. Task dapat memiliki parent dan child task.
5. Soft delete hanya diterapkan pada task.
6. Audit log bersifat append-only.

---

## Trade-off yang Dibuat

### Tidak Menggunakan Authentication

Requirement tidak meminta authentication sehingga implementasi difokuskan pada domain utama.

**Kelebihan**

* Implementasi lebih sederhana.
* Waktu pengerjaan lebih efisien.

**Kekurangan**

* Tidak dapat memverifikasi actor berdasarkan user yang benar-benar login.

---

### Menggunakan Layer Service Sederhana

**Kelebihan**

* Mudah dipahami.
* Cocok untuk aplikasi kecil hingga menengah.

**Kekurangan**

* Berpotensi menjadi terlalu besar jika business logic bertambah kompleks.

---

### Menggunakan Prisma ORM

**Kelebihan**

* Type-safe.
* Produktivitas tinggi.
* Integrasi TypeScript sangat baik.

**Kekurangan**

* Terdapat abstraksi tambahan dibanding query SQL secara langsung.

---

## Jika Ada Waktu Lebih

Hal-hal yang ingin saya tambahkan atau perbaiki:

* Menambahkan authentication menggunakan JWT.
* Menambahkan unit test dan integration test.
* Menambahkan rate limiting.

---

## Bagaimana Memastikan Audit Log Tidak Ter-Modifikasi?

Audit log dirancang sebagai data **append-only**.

Pendekatan yang digunakan:

* Tidak menyediakan endpoint update audit log.
* Tidak menyediakan endpoint delete audit log.
* Setiap perubahan status menghasilkan record audit log baru.
* Audit log lama tidak pernah diubah maupun dihapus.

Dengan pendekatan tersebut, histori perubahan tetap terjaga dan dapat ditelusuri kembali.

---

## Bagian Mana yang Paling Berisiko Jika Digunakan oleh Banyak User?

Bagian yang paling berisiko adalah proses perubahan status task.

Risiko yang mungkin terjadi:

* Race condition ketika banyak user mengubah status task yang sama secara bersamaan.
* Inkonsistensi antara status task dan audit log apabila tidak dijalankan dalam database transaction.

Mitigasi yang dapat dilakukan:

* Menggunakan database transaction.
* Menerapkan optimistic locking atau versioning.
* Menambahkan mekanisme retry pada operasi tertentu.

---

## Jika Sistem Berkembang Menjadi Lebih Besar, Bagian Mana yang Akan Direfactor Terlebih Dahulu dan Kenapa?

Bagian pertama yang akan saya refactor adalah layer service.

Alasannya:

* Business logic biasanya berkembang paling cepat.
* Service berpotensi menjadi terlalu besar dan sulit dipelihara.

Refactor yang dapat dilakukan:

* Memisahkan use case menjadi domain/service yang lebih kecil.
* Mengadopsi Clean Architecture atau modular architecture.
* Menambahkan repository pattern apabila kompleksitas meningkat.

---

## Penggunaan AI

AI digunakan sebagai alat bantu diskusi dan percepatan implementasi, bukan sebagai pengganti pemahaman.

Bagian yang dibantu AI:

* Diskusi desain database.
* Inisialisasi project menggunakan Prisma.
* Diskusi mengenai struktur folder dan arsitektur.
* Beberapa implementasi logic pada endpoint.

Validasi yang dilakukan:

* Seluruh kode dijalankan dan diuji secara manual.
* Query database diverifikasi menggunakan Prisma dan PostgreSQL.
* Endpoint diuji menggunakan Postman.
* Setiap solusi yang dihasilkan dipahami terlebih dahulu sebelum digunakan.

Dengan demikian, seluruh keputusan teknis tetap berada pada penulis dan dapat dijelaskan kembali saat proses evaluasi.
