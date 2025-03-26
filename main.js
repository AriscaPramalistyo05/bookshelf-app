// Konfigurasi localStorage key
const STORAGE_KEY = 'BOOKSHELF_APPS';

// Fungsi untuk memeriksa dukungan localStorage
function isStorageExist() {
  if (typeof(Storage) === undefined) {
    Swal.fire('Maaf', 'Browser Anda tidak mendukung local storage', 'error');
    return false;
  }
  return true;
}

// Fungsi untuk menyimpan data ke localStorage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

// Fungsi untuk memuat data dari localStorage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  
  if (data !== null) {
    books = data;
  }
  
  document.dispatchEvent(new Event('ondataloaded'));
}

// Array untuk menyimpan buku
let books = [];

// Fungsi untuk membuat ID unik
function generateId() {
  return +new Date();
}

// Fungsi untuk membuat objek buku baru
function createBook(title, author, year, isComplete) {
  return {
    id: generateId(),
    title,
    author,
    year: parseInt(year),
    isComplete
  };
}

// Fungsi untuk mencari indeks buku
function findBookIndex(bookId) {
  return books.findIndex(book => book.id === bookId);
}

// Fungsi untuk menambahkan buku
function addBook() {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const book = createBook(title, author, year, isComplete);
  books.push(book);

  document.dispatchEvent(new Event('bookchanged'));
  saveData();

  Swal.fire({
    icon: 'success',
    title: 'Berhasil!',
    text: 'Buku berhasil ditambahkan',
    timer: 1500,
    showConfirmButton: false
  });
}

// Fungsi untuk menghapus buku
function removeBook(bookId) {
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: "Buku akan dihapus permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      const bookIndex = findBookIndex(bookId);
      if (bookIndex === -1) return;
      
      books.splice(bookIndex, 1);
      document.dispatchEvent(new Event('bookchanged'));
      saveData();
      
      Swal.fire(
        'Terhapus!',
        'Buku telah dihapus.',
        'success'
      );
    }
  });
}

// Fungsi untuk memindahkan buku antar rak
function moveBook(bookId) {
  const bookIndex = findBookIndex(bookId);
  if (bookIndex === -1) return;

  books[bookIndex].isComplete = !books[bookIndex].isComplete;
  document.dispatchEvent(new Event('bookchanged'));
  saveData();

  Swal.fire({
    icon: 'success',
    title: 'Berhasil!',
    text: 'Buku dipindahkan ke rak lain',
    timer: 1500,
    showConfirmButton: false
  });
}

// Fungsi untuk mengedit buku
function editBook(bookId) {
  const bookIndex = findBookIndex(bookId);
  if (bookIndex === -1) return;

  const book = books[bookIndex];
  
  Swal.fire({
    title: 'Edit Buku',
    html: `
      <input type="text" id="editTitle" class="swal2-input" placeholder="Judul" value="${book.title}">
      <input type="text" id="editAuthor" class="swal2-input" placeholder="Penulis" value="${book.author}">
      <input type="number" id="editYear" class="swal2-input" placeholder="Tahun" value="${book.year}">
    `,
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal',
    preConfirm: () => {
      const title = document.getElementById('editTitle').value;
      const author = document.getElementById('editAuthor').value;
      const year = document.getElementById('editYear').value;
      
      if (!title || !author || !year) {
        Swal.showValidationMessage('Harap isi semua field');
      }
      
      return { title, author, year };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      books[bookIndex].title = result.value.title;
      books[bookIndex].author = result.value.author;
      books[bookIndex].year = parseInt(result.value.year);
      
      document.dispatchEvent(new Event('bookchanged'));
      saveData();
      
      Swal.fire('Berhasil!', 'Buku telah diperbarui', 'success');
    }
  });
}

// Fungsi untuk mencari buku
function searchBooks(keyword) {
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(keyword.toLowerCase())
  );
  renderBooks(filteredBooks);
}

// Fungsi untuk merender buku ke dalam rak
function renderBooks(booksToRender = books) {
  const incompleteBookshelf = document.getElementById('incompleteBookList');
  const completeBookshelf = document.getElementById('completeBookList');
  
  incompleteBookshelf.innerHTML = '';
  completeBookshelf.innerHTML = '';
  
  for (const book of booksToRender) {
    const bookElement = document.createElement('div');
    bookElement.setAttribute('data-bookid', book.id);
    bookElement.setAttribute('data-testid', 'bookItem');
    
    bookElement.innerHTML = `
      <h3 data-testid="bookItemTitle">${book.title}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
      <p data-testid="bookItemYear">Tahun: ${book.year}</p>
      <div>
        <button data-testid="bookItemIsCompleteButton">
          ${book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
        </button>
        <button data-testid="bookItemDeleteButton">Hapus Buku</button>
        <button data-testid="bookItemEditButton">Edit Buku</button>
      </div>
    `;
    
    const moveButton = bookElement.querySelector('[data-testid="bookItemIsCompleteButton"]');
    const deleteButton = bookElement.querySelector('[data-testid="bookItemDeleteButton"]');
    const editButton = bookElement.querySelector('[data-testid="bookItemEditButton"]');
    
    moveButton.onclick = () => moveBook(book.id);
    deleteButton.onclick = () => removeBook(book.id);
    editButton.onclick = () => editBook(book.id);
    
    if (book.isComplete) {
      completeBookshelf.append(bookElement);
    } else {
      incompleteBookshelf.append(bookElement);
    }
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  const bookForm = document.getElementById('bookForm');
  const searchForm = document.getElementById('searchBook');
  
  bookForm.addEventListener('submit', function(e) {
    e.preventDefault();
    addBook();
    bookForm.reset();
  });
  
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const keyword = document.getElementById('searchBookTitle').value;
    searchBooks(keyword);
  });
  
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener('bookchanged', () => {
  renderBooks();
});

document.addEventListener('ondataloaded', () => {
  renderBooks();
});
