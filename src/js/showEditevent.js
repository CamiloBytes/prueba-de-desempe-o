// editCourse.js

// Function to fetch course data
async function fetchCourseData(courseId) {
    try {
        const response = await
        api.get(`/courses/${courseId}`);
        return response;
    } catch (error) {
        console.error('Error fetching course data:', error);
        throw error;
    }
}
// Function to render the edit course view
export async function showEditevent(courseId) {    
    const app = document.getElementById("app");
    try {
        const course = await fetchCourseData(courseId);
        app.innerHTML = `
        <section id="edit-course">
            <h2>Edit Course: ${course.name}</h2>
            <form id="edit-course-form">
                <input type="text" id="course-name" value="${course.name}" required />
                <textarea id="course-description">${course.description}</textarea>
                <button type="submit">Save Changes</button>
            </form>
        </section>`;

        // Handle form submission
        document.getElementById("edit-course-form").onsubmit = async event => {
            event.preventDefault();
            // Logic to update the course
            console.log("Course updated successfully!");
        };
    } catch (error) {
        console.error('Error rendering edit course view:', error);
    }
}