// 加密相关的工具函数
const CryptoUtils = {
    // 生成随机盐值
    generateSalt: async () => {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    // 从主密码派生密钥
    deriveKey: async (password, salt) => {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const saltBuffer = encoder.encode(salt);
        
        const key = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: saltBuffer,
                iterations: 100000,
                hash: 'SHA-256'
            },
            key,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    },

    // 加密数据
    encrypt: async (data, key) => {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encoder.encode(JSON.stringify(data))
        );

        const encryptedArray = new Uint8Array(encryptedData);
        return {
            data: Array.from(encryptedArray, byte => byte.toString(16).padStart(2, '0')).join(''),
            iv: Array.from(iv, byte => byte.toString(16).padStart(2, '0')).join('')
        };
    },

    // 解密数据
    decrypt: async (encryptedData, iv, key) => {
        const decoder = new TextDecoder();
        const encryptedArray = new Uint8Array(encryptedData.match(/.{2}/g).map(byte => parseInt(byte, 16)));
        const ivArray = new Uint8Array(iv.match(/.{2}/g).map(byte => parseInt(byte, 16)));
        
        const decryptedData = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: ivArray
            },
            key,
            encryptedArray
        );

        return JSON.parse(decoder.decode(decryptedData));
    },

    // 验证主密码
    verifyMasterPassword: async (password, storedHash) => {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', passwordBuffer);
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex === storedHash;
    }
}; 