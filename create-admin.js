import axios from 'axios';

async function createAdmin() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'admin',
      email: 'admin@mail.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin créé :', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Erreur API :', err.response.data);
    } else {
      console.error('Erreur :', err.message);
    }
  }
}

createAdmin(); 