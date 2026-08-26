function Header(){
    return (
        <header class = "header">

            <div class = "header-left">
                <div class = "header-logo">
                    <h2>OdontoGestão</h2>
                </div>
            </div>

            <div class = "header-right">
                <div className = "header-user">
                   <div className = "user-info">
                    <strong>Dr(a). Dentista</strong>
                    <span>Adiministrador</span>
                   </div>

                   <div className = "user-avatar">
                    DD
                   </div>

                </div>
            </div>
        </header>
    );
}

export default Header;