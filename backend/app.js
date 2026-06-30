const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 数据存储路径
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'submissions.json');

// 确保数据目录和文件存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

// 读取所有提交记录
function readSubmissions() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// 保存提交记录
function saveSubmissions(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ---------- 中间件 ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件（前端网站）
app.use(express.static(path.join(__dirname, '..')));

// ---------- API: 提交预约表单 ----------
app.post('/api/submit', (req, res) => {
  const { name, grade, phone, message } = req.body;

  // 基本验证
  if (!name || !grade || !phone) {
    return res.status(400).json({ success: false, error: '请填写所有必填项' });
  }

  if (!/^1\d{10}$/.test(phone)) {
    return res.status(400).json({ success: false, error: '请输入正确的手机号' });
  }

  // 创建新记录
  const newSubmission = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    grade,
    phone,
    message: message || '',
    source: req.headers['referer'] || '直接访问',
    createdAt: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    timestamp: Date.now(),
  };

  // 保存
  const submissions = readSubmissions();
  submissions.unshift(newSubmission); // 最新在最前
  saveSubmissions(submissions);

  console.log(`\n📩 新预约提交！`);
  console.log(`  姓名: ${name}`);
  console.log(`  年级: ${grade}`);
  console.log(`  电话: ${phone}`);
  console.log(`  时间: ${newSubmission.createdAt}`);

  res.json({ success: true, message: '预约成功！我们会在24小时内联系您。' });
});

// ---------- API: 获取所有提交（管理后台用） ----------
app.get('/api/submissions', (req, res) => {
  const submissions = readSubmissions();
  res.json({ success: true, total: submissions.length, data: submissions });
});

// ---------- API: 删除一条提交 ----------
app.delete('/api/submissions/:id', (req, res) => {
  let submissions = readSubmissions();
  const before = submissions.length;
  submissions = submissions.filter(s => s.id !== req.params.id);
  if (submissions.length === before) {
    return res.status(404).json({ success: false, error: '记录不存在' });
  }
  saveSubmissions(submissions);
  res.json({ success: true, message: '已删除' });
});

// ---------- 管理后台页面 ----------
app.get('/admin', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>优途研学社 - 管理后台</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Noto Sans SC', sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      padding: 24px;
    }
    .header {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff;
      padding: 24px 32px;
      border-radius: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .header h1 { font-size: 1.5rem; font-weight: 700; }
    .header h1 span { color: #fbbf24; }
    .header .stats { font-size: 0.9rem; opacity: 0.85; }
    .header .actions { display: flex; gap: 8px; }
    .btn {
      padding: 8px 20px;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s;
      font-family: inherit;
    }
    .btn-primary { background: #fff; color: #2563eb; }
    .btn-primary:hover { background: #f0f0f0; }
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover { background: #dc2626; }
    .btn-sm { padding: 4px 12px; font-size: 0.8rem; }

    .empty {
      text-align: center;
      padding: 64px 24px;
      background: #fff;
      border-radius: 12px;
      border: 2px dashed #cbd5e1;
    }
    .empty i { font-size: 3rem; color: #94a3b8; margin-bottom: 16px; }
    .empty h3 { font-size: 1.2rem; color: #64748b; }

    .card {
      background: #fff;
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      transition: 0.2s;
      border-left: 4px solid #2563eb;
    }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .card__info { flex: 1; }
    .card__name {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .card__name .grade-badge {
      display: inline-block;
      background: #dbeafe;
      color: #2563eb;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-left: 8px;
    }
    .card__details {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 0.9rem;
      color: #475569;
    }
    .card__details i {
      width: 16px;
      color: #2563eb;
      margin-right: 4px;
    }
    .card__message {
      margin-top: 8px;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #64748b;
    }
    .card__time {
      font-size: 0.8rem;
      color: #94a3b8;
      white-space: nowrap;
    }
    .card__actions { flex-shrink: 0; }

    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: #fff;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      transform: translateY(100px);
      opacity: 0;
      transition: 0.3s;
    }
    .toast.show { transform: translateY(0); opacity: 1; }

    @media (max-width: 600px) {
      body { padding: 12px; }
      .header { padding: 16px 20px; }
      .card { flex-direction: column; }
      .card__details { flex-direction: column; gap: 8px; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1>🎓 优途研学社 <span>管理后台</span></h1>
      <div class="stats" id="stats">加载中...</div>
    </div>
    <div class="actions">
      <button class="btn btn-primary" onclick="refresh()">🔄 刷新</button>
      <button class="btn btn-primary" onclick="window.location.href='/'">🏠 返回首页</button>
    </div>
  </div>

  <div id="list"></div>

  <div class="toast" id="toast"></div>

  <script>
    async function loadSubmissions() {
      const list = document.getElementById('list');
      const stats = document.getElementById('stats');

      try {
        const res = await fetch('/api/submissions');
        const data = await res.json();

        if (!data.success) {
          list.innerHTML = '<div class="empty"><h3>加载失败</h3></div>';
          return;
        }

        stats.textContent = '共 ' + data.total + ' 条预约记录';

        if (data.total === 0) {
          list.innerHTML = \`
            <div class="empty">
              <div>📋</div>
              <h3>暂无预约记录</h3>
              <p style="color:#94a3b8;margin-top:8px">当有客户提交预约表单时，会在这里显示</p>
            </div>
          \`;
          return;
        }

        list.innerHTML = data.data.map(item => \`
          <div class="card">
            <div class="card__info">
              <div class="card__name">
                \${escapeHtml(item.name)}
                <span class="grade-badge">\${escapeHtml(item.grade)}</span>
              </div>
              <div class="card__details">
                <span><i class="fas fa-phone"></i> \${escapeHtml(item.phone)}</span>
                <span><i class="fas fa-clock"></i> \${escapeHtml(item.createdAt)}</span>
              </div>
              \${item.message ? '<div class="card__message">💬 ' + escapeHtml(item.message) + '</div>' : ''}
            </div>
            <div class="card__actions">
              <button class="btn btn-danger btn-sm" onclick="deleteItem('\${item.id}')">删除</button>
            </div>
          </div>
        \`).join('');
      } catch (err) {
        list.innerHTML = '<div class="empty"><h3>❌ 无法连接服务器</h3></div>';
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    async function deleteItem(id) {
      if (!confirm('确定要删除这条记录吗？')) return;
      try {
        const res = await fetch('/api/submissions/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          showToast('✅ 已删除');
          loadSubmissions();
        }
      } catch {}
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2000);
    }

    function refresh() { loadSubmissions(); }
    loadSubmissions();
    // 每10秒自动刷新
    setInterval(loadSubmissions, 10000);
  </script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</body>
</html>
  `);
});

// ---------- 启动 ----------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔════════════════════════════════════════════════════╗
  ║      🎓 优途研学社 - 官网 + 管理后台              ║
  ║                                                    ║
  ║  前台首页:  http://localhost:${PORT}                 ║
  ║  管理后台:  http://localhost:${PORT}/admin           ║
  ║                                                    ║
  ║  预约数据保存在: backend/data/submissions.json     ║
  ║  按 Ctrl+C 停止服务器                              ║
  ╚════════════════════════════════════════════════════╝
  `);
});
