import { Model, ORM } from './index.js';

class Post extends Model {
  constructor(data) {
    super(data);
    this.belongsTo(User);
  }
}
// Define User Model
class User extends Model {
  static validations = {
    pseudo: (value) => value.length > 3
  }
  constructor(data) {
    super(data);
    this.hasMany(Post);
  }
}

const orm = new ORM({
  type: 'sqlite',
  database: './databases/test.db'
});

// Use case
async function main() {
  try {
    await orm.connection.query(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, pseudo TEXT, password TEXT)`);

    // create a new user
    const newUser = await User.create({ pseudo: 'Alice', password: 'alice123' });
    console.log('New User:', newUser);

    // Get the last user
    const lastUser = await User.last();
    console.log('Last User:', lastUser);

    // Get all users
    const users = await User.all();
    console.log('All Users:', users);

    // Fetch a specific user by ID
    const foundUser = await User.findById(1);
    console.log('Found User:', foundUser);

    // Get all posts of a user
    const userPosts = await foundUser.posts;
    console.log('User Posts:', userPosts);

    // Get user of a post
    const writer = await userPosts.at(0).user;
    console.log('Post Writer:', writer);

    // Update an instance of User
    if (lastUser) {
      const updatedUser = await lastUser.update({ pseudo: 'new_alice' });
      console.log('Updated User:', updatedUser);

      updatedUser.password = 'new_alice123';
      const savedUser = await updatedUser.save();
      console.log('Saved User:', savedUser);
    }

    // Delete an instance of User
    await lastUser.delete();
    console.log('User deleted');

    // Create a new not persisted instance
    const newUser2 = new User({ pseudo: 'Bobby', password: 'bob123' });
    console.log('Not persisted New User:', newUser2);
    const persistedUser2 = await newUser2.save();
    console.log('Persisted User:', persistedUser2);

    await persistedUser2.delete();
  } catch (err) {
    console.error(err);
  } finally {
    orm.close();
  }
}

main();
