// In-memory database for development mode
// This replaces MongoDB when MONGO_URI is not available

class InMemoryDB {
  constructor() {
    this.collections = {
      chats: [],
      jobs: [],
      cache: []
    };
    this.idCounter = 1;
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = [];
    }
    
    return {
      insertOne: async (doc) => {
        const id = this.idCounter++;
        const newDoc = { _id: { toString: () => id.toString() }, ...doc };
        this.collections[name].push(newDoc);
        return { insertedId: { toString: () => id.toString() } };
      },
      
      findOne: async (query) => {
        if (query._id) {
          const idStr = typeof query._id === 'object' ? query._id.toString() : query._id.toString();
          return this.collections[name].find(doc => doc._id.toString() === idStr) || null;
        }
        
        return this.collections[name].find(doc => {
          return Object.keys(query).every(key => {
            if (key === 'status') return doc[key] === query[key];
            if (key === 'key') return doc[key] === query[key];
            return true;
          });
        }) || null;
      },
      
      findOneAndUpdate: async (query, update, options = {}) => {
        const doc = await this.collection(name).findOne(query);
        if (!doc) return { value: null };
        
        if (update.$set) {
          Object.assign(doc, update.$set);
        }
        
        return { value: doc };
      },
      
      updateOne: async (query, update) => {
        const doc = await this.collection(name).findOne(query);
        if (doc && update.$set) {
          Object.assign(doc, update.$set);
        }
        return { modifiedCount: doc ? 1 : 0 };
      },
      
      find: (query = {}) => ({
        sort: (sortObj) => ({
          limit: (limitNum) => ({
            toArray: async () => {
              let results = [...this.collections[name]];
              
              // Apply sorting
              if (sortObj.createdAt === -1) {
                results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              }
              
              return results.slice(0, limitNum);
            }
          })
        })
      }),
      
      countDocuments: async (query = {}) => {
        if (Object.keys(query).length === 0) {
          return this.collections[name].length;
        }
        
        return this.collections[name].filter(doc => {
          return Object.keys(query).every(key => doc[key] === query[key]);
        }).length;
      },
      
      deleteMany: async (query) => {
        const before = this.collections[name].length;
        this.collections[name] = [];
        return { deletedCount: before };
      },
      
      createIndex: async () => {
        // No-op for in-memory database
        return true;
      }
    };
  }
}

const memoryDB = new InMemoryDB();

async function connectDB() {
  console.log("✅ Using in-memory database for development");
  return memoryDB;
}

module.exports = { connectDB, getClient: () => null };