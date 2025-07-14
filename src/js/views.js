export function renderLanding() {
    const app = document.getElementById("app")
    app.innerHTML = `
    <section id="landing" class="hidden">
        <div class="landing-container">
            <h1>Welcome to Our Platform</h1>
            <p>Explore our courses and enhance your skills.</p>
            <a href="#/login" class="btn">Login</a>
            <a href="#/register" class="btn">Register</a>
        </div>
    </section>`
}


export function renderLogin() {
    const app = document.getElementById("app")
    app.innerHTML = `
    <!-- view Login -->
    <section id="login" class="hidden">
        <div class="login-container">
            <h2>Login</h2>

            <form id="login-form">
                <input type="email" id="Email" placeholder="Email" autocomplete="username" required />
                <input type="password" id="password" placeholder="Password" autocomplete="current-password"
                    required />
                <button type="submit">Log in </button>
            </form>
        </div>
    </section>`

    // Handle login form submission
    document.getElementById("login-form").onsubmit = async event => {
        event.preventDefault();
        try {
            const aux = event.target
            await authentication.loginUser(aux["loginUsername"].value, aux["password"].value);
            location.hash = "#/dashboard"
            router()
        } catch (error) {
            alertError("Error, Credenciales invalidas")
        }
    }
}


export function renderRegister() {
    const app = document.getElementById("app")
    app.innerHTML =
        `
        <section id="register" class="hidden">
            <div class="register-container">
                <h2>Crear cuenta</h2>
            <form id="register-form">
                
                label for="registername">Full Name</label>
                <input type="text" id="registername" placeholder="Nombre completo" required />
                
                <label for="registeremail">Email</label>
                <input type="email" id="registeremail" placeholder="Correo electrónico" required />
                
                <label for="registerpassword">Password</label>
                <input type="password" id="registerpassword" placeholder="Contraseña" required />
                
                label for="registerconfirm">Confirm Password</label>
                <input type="password" id="registerconfirm" placeholder="Confirmar contraseña" required
                
                <button type="submit">Registrarse</button>
            </form>
            </div>
        </section>`

    // Handle register form submission
    document.getElementById("register-form").onsubmit = async event => {
        event.preventDefault();
        try {
            const aux = event.target
            await authentication.registerUser(
                aux["registername"].value, 
                aux["registeremail"].value, 
                aux["registerpassword"].value);
            location.hash = "#/login"
            router()
        } catch (error) {
            alertError("Error, Credenciales invalidas")
        }
    }
    
}

export function renderDashboard() {
    const app = document.getElementById("app")
    app.innerHTML = `
        <header>
        <nav>
            <img src="" alt="Img of user or admin">
            <button id="btn-log-out" type="button">Log out</button>
        </nav>
        </header>

        <main>
        <h1>Create Event</h1>

        <form>
            <section>
            <label for="event-name">Name</label>
            <input id="event-name" type="text" placeholder="Enter event name">
            </section>

            <section>
            <label for="event-description">Description</label>
            <textarea id="event-description" placeholder="Enter event description"></textarea>
            </section>

            <section>
            <article>
                <label for="event-date">Date</label>
                <input id="event-date" type="date">
            </article>
            <article>
                <label for="event-capacity">Capacity</label>
                <input id="event-capacity" type="number" placeholder="Enter capacity">
            </article>
            </section>

            <section>
            <button type="button" id="btn-cancel">Cancel</button>
            <button type="submit" id="btn-save">Save</button>
            </section>
        </form>
        </main>
    `
    document.getElementById("btn-log-out").onclick = () => {
        authentication.logoutUser();
        location.hash = "#/login";
        router();
    };

    document.getElementById("btn-cancel").onclick = () => {
        location.hash = "#/dashboard";
        router();
    }

    document.getElementById("btn-save").onclick = async (event) => {
        event.preventDefault();
        const name = document.getElementById("event-name").value;
        const description = document.getElementById("event-description").value;
        const date = document.getElementById("event-date").value;
        const capacity = document.getElementById("event-capacity").value;
        try {
            await authentication.createEvent(name, description, date, capacity);
            location.hash = "#/dashboard";
            router();
        } catch (error) {
            alertError("Error al crear el evento");
        }
        
    }
}