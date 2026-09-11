const User = require('../models/User');
const Order = require('../models/Order');
const { Op } = require('sequelize');

function displayName(user) {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (full) return full;
  return user.username || user.email;
}

function padCrm(id) {
  return `CL-${String(id).padStart(4, '0')}`;
}

exports.getClients = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: { [Op.ne]: 'admin' } },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    const orders = await Order.findAll({
      where: { status: { [Op.ne]: 'cart' } },
      order: [['date', 'DESC']],
    });

    const byClient = {};
    for (const o of orders) {
      const key = String(o.client || '').toLowerCase();
      if (!key) continue;
      if (!byClient[key]) {
        byClient[key] = { count: 0, spent: 0, last: null, refs: [] };
      }
      const bucket = byClient[key];
      const st = String(o.status || '').toLowerCase();
      if (!st.includes('annul') && !st.includes('rembours')) {
        bucket.spent += Number(o.total) || 0;
      }
      bucket.count += 1;
      if (!bucket.last) {
        bucket.last = o;
      }
      if (bucket.refs.length < 4) {
        bucket.refs.push({
          ref: `#EP-${String(o.id).padStart(4, '0')}`,
          date: o.date,
          total: o.total,
          status: o.status,
        });
      }
    }

    const clients = users.map((u) => {
      const emailKey = String(u.email || '').toLowerCase();
      const stats = byClient[emailKey] || { count: 0, spent: 0, last: null, refs: [] };
      let type = null;
      if (stats.spent >= 20000 || stats.count >= 8) type = 'VIP';
      else if (stats.count >= 3) type = 'PRO';

      let status = 'Nouveau';
      if (stats.count > 0) status = 'Actif';
      const lastStatus = String(stats.last?.status || '').toLowerCase();
      if (lastStatus.includes('retour') || lastStatus.includes('litige')) status = 'Litige';
      if (lastStatus.includes('annul') && stats.count <= 1) status = 'Inactif';

      return {
        id: u.id,
        crmId: padCrm(u.id),
        name: displayName(u),
        email: u.email,
        phone: u.phone || '—',
        city: '—',
        type,
        address: 'Adresse non renseignée',
        registered: u.createdAt,
        ordersCount: stats.count,
        totalSpent: Number(stats.spent.toFixed(2)),
        lastOrderAt: stats.last?.date || null,
        lastOrderRef: stats.last ? `#EP-${String(stats.last.id).padStart(4, '0')}` : null,
        status,
        newsletter: Boolean(u.newsletter),
        sampleKit: Boolean(u.sampleKit),
        notes: '',
        recentOrders: stats.refs.map((r) => ({
          ...r,
          date: r.date,
          ref: r.ref,
        })),
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        role: u.role,
      };
    });

    // Clients présents seulement dans les commandes (pas de compte User)
    const knownEmails = new Set(clients.map((c) => String(c.email).toLowerCase()));
    let ghostIdx = 9000;
    for (const [email, stats] of Object.entries(byClient)) {
      if (knownEmails.has(email)) continue;
      ghostIdx += 1;
      const label = email.includes('@')
        ? email
            .split('@')[0]
            .replace(/[._]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : email;
      let type = null;
      if (stats.spent >= 20000 || stats.count >= 8) type = 'VIP';
      else if (stats.count >= 3) type = 'PRO';
      clients.push({
        id: `ord-${ghostIdx}`,
        crmId: padCrm(ghostIdx),
        name: label,
        email,
        phone: '—',
        city: '—',
        type,
        address: 'Adresse non renseignée',
        registered: stats.last?.date || null,
        ordersCount: stats.count,
        totalSpent: Number(stats.spent.toFixed(2)),
        lastOrderAt: stats.last?.date || null,
        lastOrderRef: stats.last ? `#EP-${String(stats.last.id).padStart(4, '0')}` : null,
        status: 'Actif',
        newsletter: false,
        notes: 'Client issu des commandes (sans compte)',
        recentOrders: stats.refs,
        _fromOrders: true,
      });
    }

    clients.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user || user.role === 'admin') {
      return res.status(404).json({ message: 'Client introuvable' });
    }
    const { firstName, lastName, phone, newsletter, sampleKit } = req.body;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (newsletter !== undefined) user.newsletter = Boolean(newsletter);
    if (sampleKit !== undefined) user.sampleKit = Boolean(sampleKit);
    await user.save();
    const json = user.toJSON();
    delete json.password;
    res.json(json);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
