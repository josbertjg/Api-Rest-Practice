/*

EN EL ARCHIVO CSS ESCONDER EL LOADING Y EL DIV msj-error
ES DECIR APLICARLES LA PROPIEDAD display:none;
HACER TAMBIEN DISPLAY NONE A #contentCollapse

*/

$(document).ready(()=>{
    //VERIFICANDO SI HAY NUEVOS REGISTROS EN LA TABLA PARA ANEXAR CON .on EL EVENTO DELETE
    $(document).on("click",".btnDelete",(event)=>deleteUser(event))
    //VERIFICANDO SI HAY NUEVOS REGISTROS EN LA TABLA PARA ANEXAR CON .on EL EVENTO UPDATE
    $(document).on("click","tr td:not(.none)",(event)=>showUserFields(event))

    //SHOWING USERS WHEN PAGE IS READY
    $("#loading").fadeIn();
        fetch("./html/users.html")
        .then((response) => {
            return response.text();
        })
        .then((html) => {
            $("#contenido").html(html)
        })
        .finally(()=>{
            showUsers();
            //RECREATING COLLAPSE EFECT
            $("#btnCollapse").click(()=>collapseEfect());
            //ADD BUTTON
            $("#add").click(()=>addButton());
            //UPDATE BUTTON
            $("#update").click(()=>updateButton());
            $("#sendUser").click(()=>sendUser())
            $("#readme").click(()=>{
                Swal.fire({
                    title: 'Nota Importante',
                    text: "La API utilizada para construir este programa (Reqres.in) no permite el almacenamiento de nuevos usuarios, sin embargo, permite simularlo devolviendo una respuesta positiva desde el Back-End, por ende, si intenta insertar o modificar los datos de un usuario que usted a ingresado de manera manual, se simulará dicha inserción/actualización, más, no podrá ser efectuada de manera real por lo anteriormente mencionado.",
                    icon: 'warning',
                  });
            });
        });

    //SHOWING USERS WHEN CLICKING USERS BUTTON
    $("#users").click(()=>{
        $("#contenido").empty();
        $("#loading").fadeIn();
        fetch("./html/users.html")
        .then((response) => {
            return response.text();
        })
        .then((html) => {
            $("#contenido").html(html)
        })
        .finally(()=>{
            showUsers();
            //RECREATING COLLAPSE EFECT
            $("#btnCollapse").click(()=>collapseEfect());
            //ADD BUTTON
            $("#add").click(()=>addButton());
            //UPDATE BUTTON
            $("#update").click(()=>updateButton());
            $("#sendUser").click(()=>sendUser())
            $("#readme").click(()=>{
                Swal.fire({
                    title: 'Nota Importante',
                    text: "La API utilizada para construir este programa (Reqres.in) no permite el almacenamiento de nuevos usuarios, sin embargo, permite simularlo devolviendo una respuesta positiva desde el Back-End, por ende, si intenta insertar o modificar los datos de un usuario que usted a ingresado de manera manual, se simulará dicha inserción/actualización, más, no podrá ser efectuada de manera real por lo anteriormente mencionado.",
                    icon: 'warning',
                  });
            });
        });
    });

    $("#documentation").click(()=>{
        $("#contenido").empty();
        $("#loading").fadeIn();
        fetch("./html/documentation.html")
        .then((response) => {
            return response.text();
        })
        .then((html) => {
            $("#contenido").html(html)
        })
        .finally(()=>{
            $("#loading").fadeOut();
        });  
    });
    
    $("#contact").click(()=>{
        $("#contenido").empty();
        $("#loading").fadeIn();
        fetch("./html/contact.html")
        .then((response) => {
            return response.text();
        })
        .then((html) => {
            $("#contenido").html(html)
        })
        .finally(()=>{
            $("#loading").fadeOut();
        });  
    });

});

function showUsers(){
    fetch("https://reqres.in/api/users/").then((response)=>{
        if(response.ok){
            return response.json();
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Error, your request could not be processed',
                showConfirmButton: false,
                timer: 1500
            });
        }
    })
    .then((json)=>{

        //FILLING THE TABLE
        fillingTable(json.data)

        //FINDING NEW USERS TO SHOW
        if(json.page<json.total_pages){
            let table = document.getElementById("users-table")
            let more=table.insertRow(-1)
            
            $(more).addClass("more");

            let td = more.insertCell(-1)
            $(td).html("<i class='fa-solid fa-plus'></i>");
            $(td).attr("colspan",5)
            $(more).click((event)=>{
                $("#loading").fadeIn();
                $(event.target).remove();
                fetch(`https://reqres.in/api/users?page=${json.page+1}`).then((response)=>{
                    if(response.ok)
                        return response.json();
                    else{
                        Swal.fire({
                            icon: 'error',
                            title: 'An error has occurred, try again.',
                            showConfirmButton: false,
                        });
                    }
                })
                .then((json)=>{
                    //FILLING THE TABLE
                    fillingTable(json.data)
                    $(more).removeClass("more");
                })
                .finally(()=>{
                    $("#loading").fadeOut();
                });
            });
        }
    })
    .catch((error)=>{
        Swal.fire({
            icon: 'error',
            title: 'Conection Error, please try again later.',
            showConfirmButton: false,
        });
        console.log(error);
    })
    .finally(()=>{
        $("#loading").fadeOut()
    });

}

//FILLING THE TABLE
function fillingTable(users){
    let table= document.getElementById("users-table");
    for(let i =0;i<users.length;i++){
        let newRow=table.insertRow(-1);
        for(let i=0;i<5;i++){
            newRow.insertCell(-1);
        }
        newRow.cells[0].innerText = users[i].id;
        newRow.cells[1].innerText = users[i].first_name;
        newRow.cells[2].innerText = users[i].last_name;
        newRow.cells[3].innerText = users[i].email;
        $(newRow.cells[4]).html(`<a userID='${users[i].id}' selector='a' class='btn btn-danger btnDelete'><i userID='${users[i].id}' selector='i' class='fa-solid fa-trash-can'></i></a>`);
        $(newRow.cells[4]).addClass("none")
    }
}

//CREATING OR UPDATING USER DATA
function sendUser(){
    $("#msj-error").hide();
    if(!validarLength($("[name='first_name']").val(),3) || !validarLength($("[name='last_name']").val(),3)){
        $("#msj-error").text("Su nombre y apellido deben tener al menos 3 letras.");
        $("#msj-error").fadeIn("fast");
    }else
        if(!validarCorreo($("[name='email']").val())){
            $("#msj-error").text("Debes ingresar un correo electrónico válido.");
            $("#msj-error").fadeIn("fast");
        }else{
            if($("#action").val()=="add"){
                saveUser();
            }else
                if($("#action").val()=="update"){
                    if($("#userID").text()==""){
                        Swal.fire({
                            icon: 'error',
                            title: 'You have not select an user yet.',
                            showConfirmButton: false,
                        });
                    }else
                        updateUser($("#userID").text());
                }
        }
}

//DELETING USER
function deleteUser(event){
    $("#loading").fadeIn();
    fetch(`https://reqres.in/api/users/${$(event.target).attr("userID")}`,{
        method:'DELETE'
    })
    .then((response)=>{
        if(response.ok){
            Swal.fire({
                icon: 'success',
                title: 'USER DELETED',
                showConfirmButton: false,
                timer: 1500
            });
            if($(event.target).attr("selector")=="a")
                $(event.target.parentNode.parentNode).remove();
            else
                if($(event.target).attr("selector")=="i")
                    $(event.target.parentNode.parentNode.parentNode).remove();
        }
        else{
            Swal.fire({
                icon: 'error',
                title: 'An error has occurred, please try again later.',
                showConfirmButton: false,
            });
        }
    })
    .catch((error)=>{
        console.log(error)
        Swal.fire({
            icon: 'error',
            title: 'Conection Error, please try again later',
            showConfirmButton: false,
        });
    })
    .finally(()=>$("#loading").fadeOut());
}

//CREATING USER
function saveUser(){
    $("#loading").fadeIn();
    let data = new FormData(document.getElementById("add-form"));
    fetch("https://reqres.in/api/users/",{
        method: 'POST',
        body: data
    })
    .then((response)=>{
        if(response.ok){
            return response.json();
        }else{
            Swal.fire({
                icon: 'error',
                title: 'Error, your request could not be sent',
                showConfirmButton: false,
            });
        }
    })
    .then((json)=>{
        Swal.fire({
            icon: 'success',
            title: 'USER REGISTERED',
            showConfirmButton: false,
            timer: 2000
        });
        let table = document.getElementById("users-table");
        let newRow= table.insertRow(table.rows.length-1);

        for(let i=0;i<5;i++)
        newRow.insertCell(-1);
        
        $(newRow.cells[0]).text(json.id);
        $(newRow.cells[1]).text($("[name='first_name']").val());
        $(newRow.cells[2]).text($("[name='last_name']").val());
        $(newRow.cells[3]).text($("[name='email']").val());
        $(newRow.cells[4]).html(`<a userID='${json.id}' selector='a' class='btn btn-danger btnDelete'><i userID='${json.id}' selector='i' class='fa-solid fa-trash-can'></i></a>`);

        $("[name='first_name']").val("");
        $("[name='last_name']").val("");
        $("[name='email']").val("");
        document.getElementById("btnCollapse").click();
    })
    .catch((error)=>{
        Swal.fire({
            icon: 'error',
            title: 'A conection error has occurred, please tray again later.',
            showConfirmButton: false,
        });
        console.log(error);
    })
    .finally(()=>{
        $("#loading").fadeOut();
    })
}
//SHOWING USER DATA FROM API AT THE FORM
function showUserFields(event){
    let row = event.target.parentNode;
    let id=$(row.cells[0]).text();
    if(row!=null){
        if(!isNaN(id)){
            if(id<=12){
                $("#loading").fadeIn();
                fetch(`https://reqres.in/api/users/${id}`)
                .then((response)=>{
                    if(response.ok){
                        return response.json();
                    }else{
                        Swal.fire({
                            icon: 'error',
                            title: 'Error, your request could not be processed',
                            showConfirmButton: false,
                        });
                    }
                })
                .then((json)=>{
                    let user = json.data
                    $("#update").addClass("activated");
                    $("#add").removeClass("activated");
                    $("#action").val("update");
                    $("#title").html("Update the User: ID <b id='userID'>"+user.id+"</b>")
                    $("[name='first_name']").val(user.first_name);
                    $("[name='last_name']").val(user.last_name);
                    $("[name='email']").val(user.email);
                    $("#contentCollapse").fadeIn("fast");
                })
                .catch((error)=>{
                    console.log(error)
                    Swal.fire({
                        icon: 'error',
                        title: 'An error has been occurred, please try again later.',
                        showConfirmButton: false,
                    });
                })
                .finally(()=>{
                    $("#loading").fadeOut();
                })
            //LLENANDO LOS FIELDS CON LOS DATOS DE UN USUARIO CREADO MANUALMENTE
            }else{
                let table = document.getElementById("users-table");
                for(let i=0;i<table.rows.length;i++){
                    if($(table.rows[i].cells[0]).text()==id){
                        $("[name='first_name']").val($(table.rows[i].cells[1]).text());
                        $("[name='last_name']").val($(table.rows[i].cells[2]).text());
                        $("[name='email']").val($(table.rows[i].cells[3]).text());
                    }
                }
                $("#update").addClass("activated");
                $("#add").removeClass("activated");
                $("#action").val("update");
                $("#title").html("Update the User: ID <b id='userID'>"+id+"</b>")
                $("#contentCollapse").fadeIn("fast");
            }
        }
    }
}

//UPDATING USER
function updateUser(id){
    let data = new FormData(document.getElementById("add-form"))
    $("#loading").fadeIn("fast");
    fetch(`https://reqres.in/api/users/${id}`,{
        method:'PUT',
        body: data
    })
    .then((response)=>{
        if(response.ok){
            Swal.fire({
                icon: 'success',
                title: 'CONGRATULATIONS, THE USER HAS BEEN UPDATED',
                showConfirmButton: false,
                timer: 3000
            });
            /*HAGO ESTO PORQUE EL API NO ME RETORNA LOS DATOS MODIFICADOS,
            SOLAMENTE ME RETORNA LA FECHA EN QUE SE CREÓ EL REGISTRO.
            */
            let table = document.getElementById("users-table");
            for(let i=0;i<table.rows.length;i++)
                if($(table.rows[i].cells[0]).text()==id){
                    $(table.rows[i].cells[1]).text($("[name='first_name']").val());
                    $(table.rows[i].cells[2]).text($("[name='last_name']").val());
                    $(table.rows[i].cells[3]).text($("[name='email']").val());
                }
            $("[name='first_name']").val("");
            $("[name='last_name']").val("");
            $("[name='email']").val("");
        }else
            Swal.fire({
                icon: 'error',
                title: 'Error, your request could not be processed',
                showConfirmButton: false,
            });
    })
    .catch((error)=>{
        console.log(error);
        Swal.fire({
            icon: 'error',
            title: 'An error has been occurred, please try again later',
            showConfirmButton: false,
        });
    })
    .finally(()=>$("#loading").fadeOut("fast"));
}
//RECREATING COLLAPSE EFECT
function collapseEfect(){
    if($("#contentCollapse").css("display")=="none")
        $("#contentCollapse").fadeIn("fast");
    else{
        $("#contentCollapse").fadeOut("fast");
    }
    $("[name='first_name']").val("");
    $("[name='last_name']").val("");
    $("[name='email']").val("");
}
//ADD BUTTON
function addButton(){
    $("#title").text("Add a New User:");
    $("#add").addClass("activated");
    $("#update").removeClass("activated");
    $("#action").val("add")
    $("[name='first_name']").val("");
    $("[name='last_name']").val("");
    $("[name='email']").val("");
}
//UPDATE BUTTON
function updateButton(){
    $("#title").text("Update the User: (Select an user to Update)");
    $("#update").addClass("activated");
    $("#add").removeClass("activated");
    $("#action").val("update")
    $("[name='first_name']").val("");
    $("[name='last_name']").val("");
    $("[name='email']").val("");
}
