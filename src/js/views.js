import { authentication } from "./auth.js"
import { alertError } from "./alert.js"
import { router } from "./router.js"


// Render the landing page view


export function renderLanding() {
    const app = document.getElementById("app")
    app.innerHTML = `<section class="landing">
        <header>
            <h1>Bienvenido a Event Center</h1>
            <p>Organiza y participa en los mejores eventos.</p>
        </header>
        <div class="hero-features">
            <div class="feature-card">
                <h3>Eventos únicos</h3>
                <p>Descubre eventos exclusivos en tu área.</p>
            </div>
            <div class="feature-card">
                <h3>Fácil registro</h3>
                <p>Inscríbete en eventos con solo unos clics.</p>
            </div>
            <div class="feature-card">
                <h3>Gestión eficiente</h3>
                <p>Administra tus eventos de manera profesional.</p>
            </div>
        </div>
        <nav>
            <button id="go-to-login">Iniciar sesión</button>
            <button id="go-to-register">Registrarse</button>
        </nav>
    </section>`
    document.getElementById("go-to-login").addEventListener("click", () => {
        location.hash = "#/login"
        console.log("Login successful")
        router();   
    })
    document.getElementById("go-to-register").addEventListener("click", () => {
        location.hash = "#/register"
        console.log("Register successful")
        router();
    })

    document.getElementById("cta-login").addEventListener("click", () => {
        location.hash = "#/login";
    })

    document.getElementById("cta-register").addEventListener("click", () => {
        location.hash = "#/register";
    })
}
    


export function renderLogin() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="auth-container">
        <h2>Iniciar sesión</h2>
        <form id="login-form">
            <div class="form-group">
                <label for="login-email">Correo electrónico</label>
                <input type="email" id="login-email" placeholder="Correo electrónico" required />
            </div>
            <div class="form-group">
                <label for="login-password">Contraseña</label>
                <input type="password" id="login-password" placeholder="Contraseña" required />
            </div>
            <button type="submit">Iniciar sesión</button>
        </form>
    </div>`;

    document.getElementById("login-form").onsubmit = async event => {
        event.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            const user = await authentication.loginUser(email, password);
            console.log("Inicio de sesión exitoso:", user);
            location.hash = "#/dashboard"; // Redirige al dashboard
        } catch (error) {
            alert("Error: Credenciales inválidas");
        }
    };
}

export function renderRegister() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <section id="register" class="hidden">
            <div class="register-container">
                <h2>Crear cuenta</h2>
                <form id="register-form">
                    <label for="registername">Full Name</label>
                    <input type="text" id="registername" placeholder="Nombre completo" required />
                    
                    <label for="registeremail">Email</label>
                    <input type="email" id="registeremail" placeholder="Correo electrónico" required />
                    
                    <label for="registerpassword">Password</label>
                    <input type="password" id="registerpassword" placeholder="Contraseña" required />
                    
                    <label for="registerconfirm">Confirm Password</label>
                    <input type="password" id="registerconfirm" placeholder="Confirmar contraseña" required />
                    
                    <button type="submit">Registrarse</button>
                </form>
            </div>
        </section>`;

    // Handle register form submission
    document.getElementById("register-form").onsubmit = async event => {
        event.preventDefault();
        const aux = event.target;
        try {
            
            const password = aux.registerpassword.value;
            const confirmPassword = aux.registerconfirm.value;

            // Validate password and confirm password match
            if (!password || !confirmPassword) {
                alertError("Por favor, complete todos los campos");
                return;
            }
            if (password !== confirmPassword) {
                alertError("Las contraseñas no coinciden");
                return;
            }

            // Call the authentication service to register the user
            await authentication.registerUser(
                aux.registername.value, 
                aux.registeremail.value, 
                password
            );

            location.hash = "#/dashboard";
            router();
        } catch (error) {
            alertError("Error, Credenciales invalidas");
        }
    };
}


