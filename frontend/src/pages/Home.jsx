import { useState, useEffect } from "react"
import api from "../api"
import Note from "../components/Note";
import "../styles/Home.css";

function Home() {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("")
    const [title, setTitle] = useState("")

    useEffect(() => {
        getNotes();
    }, [])

    const getNotes = () => {
        api.get("/api/notes/")
        .then((res) => res.data)
        .then((data) => {setNotes(data); console.log(data) })
        .catch((err) => alert(err));

    }

    const deleteNote = (id) => {
        api.delete(`/api/notes/delete/${id}/`).then((res) => {
            if (res.status === 204) alert("note deleted");
            else alert("failed to delete the note");
            getNotes();
            

        }).catch((error) => alert(error))
       
        
    }

    const createNote = (e) => {
        e.preventDefault()
        api.post("api/notes/", {content, title}).then((res) => {
            if (res.status == 201) alert("Note created");
                else alert ("failed to make note");
                getNotes();
        }).catch((err) => alert(err))
       

    }


    return <div>
        <h1> Home </h1>
        <div>
            <h2>Notes</h2>
            {notes.map((note) => <Note note={note} onDelete={deleteNote} key={note.id}/>)}
        </div>
        <h2>Create a note</h2>
        <form onSubmit={createNote}>
            <label htmlFor="title">Title</label>
            <br/>

            <input type = "text" 
            id = "title" 
            name = "title" 
            required 
            onChange={(e) => setTitle(e.target.value)}
            value={title}/>
            <br/>

            <textarea id="content" 
            name = "content"
            required 
            value = {content} 
            onChange={(e) => setContent(e.target.value)}>
            </textarea>

            <input type="submit" value = "Submit"></input>


        </form>
        </div>
}
export default Home