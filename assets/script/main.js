// --- Inisialisasi Variabel & Event ---
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
let isEditing = false;
let editedBookId = null;

// --- Helper Functions ---
function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: Number(year),
    isComplete
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// --- Fungsi Modal (Popup) ---
function showModal() {
    document.getElementById('bookModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('bookModal').style.display = 'none';
    resetForm();
}

function resetForm() {
    document.getElementById('bookForm').reset();
    isEditing = false;
    editedBookId = null;
    document.getElementById('modalTitle').innerText = 'Tambah Buku Baru';
    document.getElementById('bookFormSubmit').innerText = 'Simpan Buku';
}

// --- Fungsi Manipulasi Data ---
function addBook() {
  const textTitle = document.getElementById('bookFormTitle').value;
  const textAuthor = document.getElementById('bookFormAuthor').value;
  const textYear = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, textTitle, textAuthor, textYear, isComplete);

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  closeModal(); 
}

function updateBook() {
  const textTitle = document.getElementById('bookFormTitle').value;
  const textAuthor = document.getElementById('bookFormAuthor').value;
  const textYear = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const bookIndex = findBookIndex(editedBookId);

  if (bookIndex !== -1) {
    books[bookIndex] = generateBookObject(editedBookId, textTitle, textAuthor, textYear, isComplete);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    closeModal(); 
  }
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  document.getElementById('bookFormTitle').value = bookTarget.title;
  document.getElementById('bookFormAuthor').value = bookTarget.author;
  document.getElementById('bookFormYear').value = bookTarget.year;
  document.getElementById('bookFormIsComplete').checked = bookTarget.isComplete;

  isEditing = true;
  editedBookId = bookId;

  document.getElementById('modalTitle').innerText = 'Edit Buku';
  document.getElementById('bookFormSubmit').innerText = 'Simpan Perubahan';
  
  showModal(); 
}

function searchBooks(keyword) {
  const filteredBooks = books.filter((book) => 
    book.title.toLowerCase().includes(keyword.toLowerCase())
  );
  renderBooks(filteredBooks);
}

// --- Fungsi Render ---
function renderBooks(bookList = books) {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (const bookItem of bookList) {
    const bookElement = makeBookElement(bookItem);
    
    if (!bookItem.isComplete) {
      incompleteBookList.append(bookElement);
    } else {
      completeBookList.append(bookElement);
    }
  }
}

function makeBookElement(bookObject) {
  const container = document.createElement('article');
  container.classList.add('book-card');
  container.setAttribute('data-bookid', bookObject.id);
  container.setAttribute('data-testid', 'bookItem');

  const coverDiv = document.createElement('div');
  coverDiv.classList.add('card-cover');
  coverDiv.innerHTML = `<i class="fas fa-book"></i>`;

  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('card-body');

  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;
  textTitle.setAttribute('data-testid', 'bookItemTitle');

  const textAuthor = document.createElement('p');
  textAuthor.innerText = bookObject.author;
  textAuthor.setAttribute('data-testid', 'bookItemAuthor');

  const textYear = document.createElement('p');
  textYear.innerText = bookObject.year;
  textYear.setAttribute('data-testid', 'bookItemYear');

  bodyDiv.append(textTitle, textAuthor, textYear);

  const actionContainer = document.createElement('div');
  actionContainer.classList.add('card-actions');

  const completeButton = document.createElement('button');
  completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  
  if (bookObject.isComplete) {
    completeButton.innerHTML = '<i class="fas fa-undo"></i>';
    completeButton.classList.add('action-btn', 'btn-incomplete');
    completeButton.setAttribute('title', 'Tandai belum selesai');
    completeButton.addEventListener('click', function () {
      undoBookFromCompleted(bookObject.id);
    });
  } else {
    completeButton.innerHTML = '<i class="fas fa-check"></i>';
    completeButton.classList.add('action-btn', 'btn-complete');
    completeButton.setAttribute('title', 'Tandai selesai');
    completeButton.addEventListener('click', function () {
      addBookToCompleted(bookObject.id);
    });
  }

  const editButton = document.createElement('button');
  editButton.innerHTML = '<i class="fas fa-edit"></i>';
  editButton.classList.add('action-btn', 'btn-edit');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.setAttribute('title', 'Edit buku');
  editButton.addEventListener('click', function () {
    editBook(bookObject.id);
  });

  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
  deleteButton.classList.add('action-btn', 'btn-delete');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.setAttribute('title', 'Hapus buku');
  deleteButton.addEventListener('click', function () {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
        removeBook(bookObject.id);
    }
  });

  actionContainer.append(completeButton, editButton, deleteButton);
  
  container.append(coverDiv, bodyDiv, actionContainer);

  return container;
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', function () {
  const bookForm = document.getElementById('bookForm');
  const searchForm = document.getElementById('searchBook');

  const btnShowModal = document.getElementById('btnShowModal');
  const btnCloseModal = document.querySelector('.close-modal');
  const modal = document.getElementById('bookModal');

  btnShowModal.addEventListener('click', showModal);
  btnCloseModal.addEventListener('click', closeModal);
  
  window.addEventListener('click', function(event) {
      if (event.target == modal) {
          closeModal();
      }
  });

  bookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (isEditing) {
      updateBook();
    } else {
      addBook();
    }
  });

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTitle = document.getElementById('searchBookTitle').value;
    searchBooks(searchTitle);
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  renderBooks(books);
});