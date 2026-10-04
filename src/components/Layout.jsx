import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <>
      <Header />

      <div className="container">
        <Sidebar />

        <main className="content">
          {children}
        </main>
      </div>

      <Footer />
    </>
  );
}

export default Layout;