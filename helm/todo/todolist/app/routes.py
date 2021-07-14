from flask import render_template, request, redirect
from app import app
from app import database as db

@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        item = request.form['content']
        new_item = db.Todo(content=item)

        if db.edit_todo(new_item):
            return redirect('/')
        else:
            return 'Something went wrong!'
    else:
        toDoList = db.get_todo()
        return render_template('index.html', toDoList=toDoList)


@app.route('/delete/<int:id>')
def delete(id):
    item = db.Todo.query.get_or_404(id)

    if db.remove_todo(item):
        return redirect('/')
    else:
        return 'Something went wrong!'

@app.route('/update/<int:id>', methods=['GET', 'POST'])
def update(id):
    toDoList = db.Todo.query.get_or_404(id)

    if request.method == 'POST':
        toDoList.content = request.form['content']

        if db.commit_todo():
            return redirect('/')
        else:
            return 'Something went wrong!'
    else:
        return render_template('update.html', toDoList=toDoList)
