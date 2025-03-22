const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 80;

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname))); // 使用绝对路径服务静态文件

// 确保数据目录存在
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// 确保用户数据文件存在
async function ensureUsersFile() {
    try {
        await fs.access(USERS_FILE);
    } catch {
        await fs.writeFile(USERS_FILE, JSON.stringify({ users: {} }));
    }
}

// 获取用户数据
async function getUsersData() {
    await ensureUsersFile();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
}

// 保存用户数据
async function saveUsersData(data) {
    await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
}

// 获取用户的密码库文件路径
function getUserVaultPath(username) {
    return path.join(DATA_DIR, `vault_${username}.json`);
}

// API路由
// 保存主密码哈希
app.post('/api/save-master-hash', async (req, res) => {
    try {
        const { username, hash } = req.body;
        await ensureDataDir();
        
        const usersData = await getUsersData();
        usersData.users[username] = {
            hash,
            createdAt: new Date().toISOString()
        };
        await saveUsersData(usersData);
        
        res.json({ success: true });
    } catch (error) {
        console.error('保存主密码哈希失败:', error);
        res.status(500).json({ error: '保存失败' });
    }
});

// 获取用户列表
app.get('/api/get-user-list', async (req, res) => {
    try {
        const usersData = await getUsersData();
        const userList = Object.keys(usersData.users).map(username => ({
            username,
            createdAt: usersData.users[username].createdAt
        }));
        res.json({ users: userList });
    } catch (error) {
        console.error('获取用户列表失败:', error);
        res.status(500).json({ error: '获取失败' });
    }
});

// 验证主密码
app.post('/api/verify-master-hash', async (req, res) => {
    try {
        const { username, hash } = req.body;
        const usersData = await getUsersData();
        const user = usersData.users[username];
        
        if (!user) {
            res.json({ valid: false });
            return;
        }
        
        res.json({ valid: user.hash === hash });
    } catch (error) {
        console.error('验证主密码失败:', error);
        res.status(500).json({ error: '验证失败' });
    }
});

// 保存密码库
app.post('/api/save-vault', async (req, res) => {
    try {
        const { username, vault } = req.body;
        await ensureDataDir();
        await fs.writeFile(getUserVaultPath(username), vault);
        res.json({ success: true });
    } catch (error) {
        console.error('保存密码库失败:', error);
        res.status(500).json({ error: '保存失败' });
    }
});

// 加载密码库
app.get('/api/load-vault/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const vaultPath = getUserVaultPath(username);
        
        try {
            const data = await fs.readFile(vaultPath, 'utf8');
            res.json({ vault: JSON.parse(data) });
        } catch (error) {
            if (error.code === 'ENOENT') {
                res.json({ vault: { entries: [] } });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('加载密码库失败:', error);
        res.status(500).json({ error: '加载失败' });
    }
});

// 删除用户
app.delete('/api/delete-user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const usersData = await getUsersData();
        
        // 删除用户信息
        delete usersData.users[username];
        await saveUsersData(usersData);
        
        // 删除用户的密码库
        try {
            await fs.unlink(getUserVaultPath(username));
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('删除用户失败:', error);
        res.status(500).json({ error: '删除失败' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
}); 