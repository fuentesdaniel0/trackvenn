
const fs = require('fs');
const path = require('path');
const DataStoreClass = require('./DataStore').constructor;

describe('DataStore', () => {
  let dataStore;

  beforeEach(() => {
    // Reset DataStore singleton behavior by creating a fresh instance
    dataStore = new DataStoreClass();
    dataStore.users = new Map();
    dataStore.hosts = new Set();
    dataStore.matches = [];
    dataStore.currentUser = null;
    
    // Mock the data path to avoid writing to real files during tests
    dataStore.dataPath = path.join(__dirname, '..', 'data', 'test');
    dataStore.hostFile = path.join(dataStore.dataPath, 'host.json');
    
    if (!fs.existsSync(dataStore.dataPath)) {
      fs.mkdirSync(dataStore.dataPath, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(dataStore.hostFile)) {
      fs.unlinkSync(dataStore.hostFile);
    }
    if (fs.existsSync(dataStore.dataPath)) {
      fs.rmdirSync(dataStore.dataPath);
    }
  });

  describe('User Management', () => {
    it('should add a user and their tracks', () => {
      const user = { id: 'user1', tracks: [{ id: 't1' }] };
      dataStore.addUser(user);
      expect(dataStore.users.has('user1')).toBe(true);
      expect(dataStore.users.get('user1').tracks.length).toBe(1);
    });

    it('should check if user is in data store', () => {
      expect(dataStore.isIn('user1')).toBe(false);
      dataStore.addUser({ id: 'user1', tracks: [] });
      expect(dataStore.isIn('user1')).toBe(true);
    });
  });

  describe('Host Management', () => {
    it('should save a host and persist to disk', () => {
      const success = dataStore.saveHost('host1', [{ id: 't1' }]);
      expect(success).toBe(true);
      expect(dataStore.hosts.has('host1')).toBe(true);
      expect(dataStore.getUserIds()).toEqual(expect.arrayContaining([{ id: 'host1', displayName: 'host1' }]));
      expect(fs.existsSync(dataStore.hostFile)).toBe(true);
    });

    it('should remove a host and delete from disk', () => {
      dataStore.saveHost('host1', []);
      expect(dataStore.hosts.has('host1')).toBe(true);
      
      dataStore.removeHost('host1');
      expect(dataStore.hosts.has('host1')).toBe(false);
      expect(fs.existsSync(dataStore.hostFile)).toBe(false);
    });
  });

  describe('Intersection Logic', () => {
    it('should generate an intersection correctly', () => {
      dataStore.setCurrentUser('userA');
      dataStore.addUser({ id: 'userA', tracks: [{ id: 't1', name: 'Song 1' }, { id: 't2', name: 'Song 2' }] });
      dataStore.addUser({ id: 'userB', tracks: [{ id: 't2', name: 'Song 2' }, { id: 't3', name: 'Song 3' }] });
      dataStore.hosts.add('userB');

      const intersection = dataStore.generateIntersection('userA', 'userB');
      
      expect(intersection).toBeDefined();
      expect(intersection.length).toBe(1);
      expect(intersection[0].id).toBe('t2');
      
      // Should save to history
      expect(dataStore.matches.length).toBe(1);
      expect(dataStore.matches[0].callerId).toBe('userA');
      expect(dataStore.matches[0].otherUserId).toBe('userB');
    });

    it('should return null if user is not a host', () => {
      dataStore.setCurrentUser('userA');
      dataStore.addUser({ id: 'userA', tracks: [] });
      dataStore.addUser({ id: 'userB', tracks: [] });
      
      expect(() => dataStore.generateIntersection('userA', 'userB')).toThrow('SESSION_ENDED');
    });
  });

  describe('History Management', () => {
    it('should retrieve history for a specific user', () => {
      dataStore.matches = [
        { callerId: 'userA', otherUserId: 'userB', timestamp: 100 },
        { callerId: 'userC', otherUserId: 'userA', timestamp: 200 },
        { callerId: 'userB', otherUserId: 'userC', timestamp: 300 }
      ];
      
      const historyA = dataStore.getHistoryForUser('userA');
      expect(historyA.length).toBe(2);
      // Sorted newest first
      expect(historyA[0].timestamp).toBe(200);
    });

    it('should clear all history for a user', () => {
      dataStore.matches = [
        { callerId: 'userA', otherUserId: 'userB', timestamp: 100 },
        { callerId: 'userC', otherUserId: 'userA', timestamp: 200 }
      ];
      
      dataStore.clearHistoryForUser('userA');
      expect(dataStore.matches.length).toBe(0);
    });

    it('should delete a specific match', () => {
      dataStore.matches = [
        { callerId: 'userA', otherUserId: 'userB', timestamp: 100 },
        { callerId: 'userC', otherUserId: 'userA', timestamp: 200 }
      ];
      
      dataStore.deleteMatch(100);
      expect(dataStore.matches.length).toBe(1);
      expect(dataStore.matches[0].timestamp).toBe(200);
    });
  });
});
