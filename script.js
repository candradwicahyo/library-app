window.addEventListener('DOMContentLoaded', () => {
  
  // array kosong
  let books = [];
  
  // tempat menampilkan element yang sudah dirender
  const content = document.querySelector('.content');
  
  // input
  const inputTitle = document.querySelector('.input-title');
  const inputAuthor = document.querySelector('.input-author');
  const inputDate = document.querySelector('.input-date');
  const inputStatus = document.querySelector('.input-status');
  
  // judul modal
  const modalTitle = document.querySelector('.modal-title');
  
  window.addEventListener('click', event => {
    // jika element yang ditekan memiliki class "btn-modal"
    if (event.target.classList.contains('btn-modal')) {
      // ambil isi atribut "data-type" dari element yang ditekab
      const type = event.target.dataset.type.toLowerCase();
      // set judul modal dengan isi dari variabel "type"
      modalTitle.textContent = `Modal ${type} book`;
      /*
        jika pada saat menekan element dengan class "btn-modal" dan judul modal tersebut bertuliskan
        kata "add" maka jalankan fungsi clearForm() untuk membersihkan value input
      */
      if (modalTitle.textContent.includes('add')) clearForm();
    }
  });
  
  function clearForm() {
    // bersihkan form
    const formWrapper = document.querySelector('.form-wrapper');
    formWrapper.reset();
  }
  
  // ketika tombol submit ditekan, maka jalankan fungsi addBook()
  const btnSubmit = document.querySelector('.btn-submit');
  btnSubmit.addEventListener('click', addBook);
  
  function addBook(event) {
    // mencegah default behavior dari element HTML seperti form
    event.preventDefault();
    
    // jika judul modal bertuliskan kata "add"
    if (modalTitle.textContent.includes('add')) {
      
      // value input
      const title = inputTitle.value.trim();
      const author = inputAuthor.value.trim();
      const date = inputDate.value.trim();
      const status = inputStatus.value.trim();
      
      // jadikan value input sebagai objek
      const data = {
        title: title,
        author: author,
        date: date,
        status: status
      };
      
      // lakukan validasi terlebih dahulu
      if (validate(data) == true) {
        
        /*
          lakukan validasi sekali lagi, validasi kali ini bertujuan untuk mengecek
          apakah buku yang dibuat sudah pernah dibuat sebelumnya atau belum dibuat sama sekali
        */
        if (isBookExist(data)) {
          // jika buku sudah pernah dibuat sebelumnya
          return alerts('error', 'The book is already in the list!');
        } else {
          
          // jika buku tersebut belum pernah dibuat sebelumnya
          // masukkan isi variabel "data" kedalam variabel "books"
          books.unshift(data);
          // simpan isi variabel "books" kedalam localstorage
          saveToLocalstorage();
          // render dan tampilkan element tersebut
          showUI(data);
          // berikan pesan bahwa "buku berhasil ditambahkan"
          alerts('success', 'New book has been added!');
          // load data yang ada di dalam localstorage
          loadBook();
          // bersihkan value form
          clearForm();
          
        }
        
      }
      
    }
  }
  
  function validate({title, author, date}) {
    // jika input "title", "author" dan "status" kosong
    if (!title && !author && !date) return alerts('error', 'All input is empty!');
    // jika masih ada input yang kosong
    if (!title || !author || !date) return alerts('error', 'Input is empty!');
    // jika isi input title terlalu panjang
    if (title.length > 100) return alerts('error', 'field title must be no more than 100 character!');
    // jika field author berisikan angka
    if (author.match(/[0-9]/gi)) return alerts('error', 'please enter the author`s name using letters only!');
    // jika berhasil melewati semua validasi
    return true;
  }
  
  function alerts(type, text) {
    // plugin dari "sweetalert2"
    swal.fire ({
      icon: type,
      title: 'Alert!',
      text: text
    });
  }
  
  function isBookExist({title, author, date, status}) {
    // hasil default jika tidak ada buku yang dibuat sebelumnya
    let exist = false;
    books.forEach(book => {
      if (book.title == title && book.author == author && book.date == date) exist = true;
      if (book.title == title && book.author == author && book.date == date && book.status != status) exist = false;
      if (book.title == title && book.author == author && book.date != date && book.status == status) exist = false;
    });
    // kembalikan nilai berupa boolean true atau false
    return exist;
  }
  
  function saveToLocalstorage() {
    /*
      simpan isi variabel "books" kedalam localstorage dan jadikan is variabel
      "books" sebagai string JSON
    */
    localStorage.setItem('library-app', JSON.stringify(books));
  }
  
  function showUI(data, index = 0) {
    // render data menjadi element HTML
    const result = elementUI(data, index);
    // tampilkan element tersebut
    content.insertAdjacentHTML('beforeend', result);
  }
  
  function loadBook() {
    // bersihkan isi element "content"
    content.innerHTML = '';
    // ambil data pada localstorage
    const data = localStorage.getItem('library-app');
    /*
      jika variabel "data" menghasilkan boolean true maka ubah isi variabel
      "books" dengan data yang sudah diparsing menjadi JSON. tapi jika variabel "data"
      menghasilkan boolean false maka ubah isi variabel "books" dengan array kosong
    */
    books = (data) ? JSON.parse(data) : [];
    // looping variabel "books" dan jalankan fungsi showUI()
    books.forEach((book, index) => showUI(book, index));
  }
  
  loadBook();
  
  function elementUI({title, author, date, status}, index) {
    return `
    <tr>
      <td class="p-3 fw-light">${title}</td>
      <td class="p-3 fw-light">${author}</td>
      <td class="p-3 fw-light">${date}</td>
      <td class="p-3">
        <div class="d-flex justify-content-center align-items-center">
          <span class="badge p-2 rounded-1 ${setTypeBadge(status)}">
            ${status}
          </span>
        </div>
      </td>
      <td class="p-3">
        <button 
          class="btn btn-success btn-sm btn-edit rounded-0 btn-modal m-1"
          data-index="${index}"
          data-type="edit"
          data-bs-toggle="modal"
          data-bs-target="#modalBox">
          edit
        </button>
        <button 
          class="btn btn-danger btn-sm btn-delete rounded-0 m-1"
          data-index="${index}">
          delete
        </button>
      </td>
    </tr>
    `;
  }
  
  function setTypeBadge(status) {
    /*
      jika isi parameter status bertuliskan kata "read" maka kembalikan nilai berupa string bertuliskan
      "text-bg-success". selain itu maka kembalikan nilai berupa string bertuliskan "text-bg-danger"
    */
    return (status == 'read') ? 'text-bg-success' : 'text-bg-danger';
  }
  
  // hapus buku
  window.addEventListener('click', event => {
    // jika element yang ditekan memiliki class "btn-delete"
    if (event.target.classList.contains('btn-delete')) {
      // dapatkan isi atribut "data-index" pada element yang ditekan
      const index = event.target.dataset.index;
      // jalankan fungsi deleteData()
      deleteData(index);
    }
  });
  
  function deleteData(index) {
    // plugin "sweetalert2"
    swal.fire ({
      icon: 'info',
      title: 'Alert!',
      text: 'do you want to delete this book?',
      showCancelButton: true
    })
    .then(response => {
      // jika tombol yang ditekan bertuliskan "ok" atau "yes"
      if (response.isConfirmed) {
        // hapus array dengan index sesuai isi parameter "index"
        books.splice(index, 1);
        // simpan isi variabel "books" kedalam localstorage
        saveToLocalstorage();
        // berikan pesan bahwa "buku berhasil dihapus"
        alerts('success', 'Book has been deleted!');
        // load data yang ada didalam localstorage
        loadBook();
      }
    });
  }
  
  // edit buku
  window.addEventListener('click', event => {
    // jika element yang ditekan memiliki class "btn-edit"
    if (event.target.classList.contains('btn-edit')) {
      // ambil isi atribut "data-index" dari element yang ditekan
      const index = event.target.dataset.index;
      // set isi array dengan index sesuai variabel "index" kedalam input
      setValueInput(index);
      // jalankan fungsi editData()
      editData(index);
    }
  });
  
  function setValueInput(index) {
    // set value pada input
    inputTitle.value = books[index].title;
    inputAuthor.value = books[index].author;
    inputDate.value = books[index].date;
    inputStatus.value = books[index].status;
  }
  
  function editData(index) {
    // ketika tombol submit ditekan
    btnSubmit.addEventListener('click', event => {
      // jika judul modal bertuliskan kata "edit"
      if (modalTitle.textContent.includes('edit')) {
        
        // value input
        const title = inputTitle.value.trim();
        const author = inputAuthor.value.trim();
        const date = inputDate.value.trim();
        const status = inputStatus.value.trim();
        
        // jadikan value input sebagai objek
        const data = {
          title: title,
          author: author,
          date: date,
          status: status
        };
        
        // lakukan validasi terlebih dahulu
        if (validate(data) == true) {
          
          /*
            lakukan validasi sekali lagi, validasi kali ini bertujuan untuk mengecek
            apakah buku yang dibuat sudah pernah dibuat sebelumnya atau belum dibuat sama sekali
          */
          if (isBookExist(data)) {
            // jika buku sudah pernah dibuat sebelumnya
            return alerts('error', 'The book is already in the list!');
          } else {
            
            // jika buku tersebut belum pernah dibuat sebelumnya
            // ubah isi array dari index sesuai isi parameter "index"
            books[index].title = title;
            books[index].author = author;
            books[index].date = date;
            books[index].status = status;
            // simpan isi variabel "books" kedalam localstorage
            saveToLocalstorage();
            // jadikan variabel "books" dan parameter "index" sebagai null supaya tidak ada data yang duplikat
            books = null, index = null;
            // berikan pesan bahwa "buku berhasil diubah"
            alerts('success', 'Book has been updated!');
            // load data yang ada didalam localstorage
            loadBook();
            
          }
          
        }
        
      }
    });
  }
  
  // input pencarian data 
  const searchInput = document.querySelector('.search-input');
  searchInput.addEventListener('keyup', function() {
    // value input pencarian
    const value = this.value.trim().toLowerCase();
    // ubah yang tadinya "Nodelist" menjadi Array
    const result = Array.from(content.rows);
    // looping variabel "result"
    result.forEach(data => {
      /*
        jika ada data yang serupa dengan isi input pencarian, maka tampilkan
        data buku tersebut. jika ada data yang tidak serupa degan isi input pencarian,
        maka sembunyikan data buku tersebut.
      */
      const string = data.textContent.trim().toLowerCase();
      data.style.display = (string.indexOf(value) != -1) ? '' : 'none';
    });
  });
  
  // tombol hapus semua data buku
  const btnDeleteAll = document.querySelector('.btn-delete-all');
  btnDeleteAll.addEventListener('click', deleteAllBook);
  
  function deleteAllBook() {
    // plugin dari "sweetalert2"
    swal.fire ({
      icon: 'info',
      title: 'Are you sure?',
      text: 'do you want to delete all book?',
      showCancelButton: true
    })
    .then(response => {
      // jika tombol yang ditekan bertuliskan "ok" atau "yes"
      if (response.isConfirmed) {
        // hapus isi variabel "books" dan gantikan dengan array kosong
        books = [];
        // simpan isi variabel "books" kedalam localstorage
        saveToLocalstorage();
        // berikan pesan bahwa "semua data buku berhasil dihapus"
        alerts('success', 'All book has been deleted!');
        // load data yang ada didalam localstorage
        loadBook();
      }
    })
  }
  
});