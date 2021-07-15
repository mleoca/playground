from datetime import datetime
from app import db

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Todo %r>' % self.id
        
db.create_all()

def get_todo():
    toDoList = Todo.query.order_by(Todo.date_created).all()
    return toDoList

def edit_todo(item):
    try:
        db.session.add(item)
        db.session.commit()
        return True
    except:
        return False

def remove_todo(id):
    try:
        db.session.delete(id)
        db.session.commit()
        return True
    except:
        return False

def commit_todo():
    try:
        db.session.commit()
        return True
    except:
        return False