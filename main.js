const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved_book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBooks();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = parseInt(document.getElementById('inputBookYear').value);
    const isCompleted = document.getElementById('inputBookIsComplete').value;

    const generatedID = generateId();
    const isComplete = inputBookIsComplete.checked
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isComplete);
    books.push(bookObject);
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBOOKList = document.getElementById('incompleteBookshelfList');
    uncompletedBOOKList.innerHTML = '';

    const completedBOOKList = document.getElementById('completeBookshelfList');
    completedBOOKList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) {
            uncompletedBOOKList.append(bookElement);
        }
        else
            completedBOOKList.append(bookElement);
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Penulis: ' + bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Tahun: ' + bookObject.year;

    const textContainer = document.createElement('article');
    textContainer.classList.add('book_item');
    textContainer.append(textTitle, textAuthor, textYear);

    const container = document.createElement('div');
    container.classList.add('action');
    textContainer.append(container);

    container.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerText = 'Belum selesai dibaca';

        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = 'Hapus buku';

        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        });

        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('green');
        checkButton.innerText = 'Selesai dibaca';

        checkButton.addEventListener('click', function () {
            addTaskToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = 'Hapus buku';

        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(bookObject.id);
        });

        container.append(checkButton, trashButton);
    }

    return textContainer;
}

function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

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

function searchBooks() {
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    const searchResults = books.filter(book => book.title.toLowerCase().includes(searchTitle));

    const uncompletedBOOKList = document.getElementById('incompleteBookshelfList');
    const completedBOOKList = document.getElementById('completeBookshelfList');

    uncompletedBOOKList.innerHTML = '';
    completedBOOKList.innerHTML = '';

    searchResults.forEach(bookItem => {
        const bookElement = makeBook(bookItem);
        if (bookItem.isCompleted) {
            completedBOOKList.append(bookElement);
        } else {
            uncompletedBOOKList.append(bookElement);
        }
    });
}