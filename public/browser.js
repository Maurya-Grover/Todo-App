//generic template for adding items to HTML
function addItem(item) {
	return `<li	class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
				<span class="item-text">${item.task}</span>
				<div>
					<button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
					<button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
				</div>
			</li>`;
}

// Initial Page Load
let inputHTML = items
	.map((item) => {
		return addItem(item);
	})
	.join('');
document.getElementById('item-list').insertAdjacentHTML('beforeend', inputHTML);

// Create/Add
let createField = document.getElementById('create-field');
document.getElementById('create-form').addEventListener('submit', (e) => {
	e.preventDefault();
	let userInput = createField.value;
	axios
		.post('/create-item', { task: userInput })
		.then((response) => {
			document
				.getElementById('item-list')
				.insertAdjacentHTML('beforeend', addItem(response.data));
			createField.value = '';
			createField.focus();
			console.log(response.data);
		})
		.catch(() => {
			console.log('Task could not be added. Please try again');
		});
});

document.addEventListener('click', function (e) {
	// Delete item
	if (e.target.classList.contains('delete-me')) {
		if (confirm('Do you really want to delete this item permanently?')) {
			axios
				.post('/delete-item', { id: e.target.getAttribute('data-id') })
				.then(() => {
					e.target.parentElement.parentElement.remove();
				})
				.catch(() => {
					console.log('Task could not be deleted. Please try again');
				});
		}
	}
	// Update Item
	if (e.target.classList.contains('edit-me')) {
		let userInput = prompt(
			'Enter your desired new text',
			e.target.parentElement.parentElement.querySelector('.item-text').innerHTML
		);
		if (userInput) {
			axios
				.post('/update-item', {
					task: userInput,
					id: e.target.getAttribute('data-id'),
				})
				.then(() => {
					e.target.parentElement.parentElement.querySelector(
						'.item-text'
					).innerHTML = userInput;
				})
				.catch(() => {
					console.log('Task could not be edited. Please try again');
				});
		}
	}
});
