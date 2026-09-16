import { Link } from 'react-router-dom';

export default function ShopFooter() {
  return (
    <footer className="ae-shop-footer">
      <div className="ae-shop-footer-inner">
        <div className="ae-shop-footer-grid">
          <div>
            <h4>Épure Studio</h4>
            <p>
              Maison d’édition et curation d’objets intemporels, façonnés avec précision et
              rigueur architecturale.
            </p>
            <p className="ae-shop-copy">© 2024 épure studio — tous droits réservés.</p>
          </div>
          <div>
            <h4>Découverte</h4>
            <ul>
              <li>
                <Link to="/home">Série Minérale</Link>
              </li>
              <li>
                <Link to="/home">Artisanat Laiton</Link>
              </li>
              <li>
                <Link to="/home">Mobilier Sculptural</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Maison</h4>
            <ul>
              <li>
                <Link to="/home">Manifeste</Link>
              </li>
              <li>
                <Link to="/home">Atelier &amp; Savoir-faire</Link>
              </li>
              <li>
                <Link to="/home">Engagements durables</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Service client</h4>
            <ul>
              <li>
                <Link to="/home">Expéditions &amp; Retours</Link>
              </li>
              <li>
                <Link to="/home">Authenticité &amp; Soin</Link>
              </li>
              <li>
                <Link to="/collection-privee">Conciergerie privée</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
