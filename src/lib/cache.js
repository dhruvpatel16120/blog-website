/**
 * High-Performance LRU (Least Recently Used) Cache with TTL Support
 * 
 * DSA Implementation:
 * - Hash Map: O(1) key-to-node lookup
 * - Doubly Linked List: O(1) insertion, deletion, and eviction to head/tail
 * - Time-To-Live (TTL): automatic expiration per entry
 */

class DoublyLinkedListNode {
  constructor(key, value, expiresAt) {
    this.key = key;
    this.value = value;
    this.expiresAt = expiresAt;
    this.prev = null;
    this.next = null;
  }
}

export class LRUCache {
  constructor(capacity = 500, defaultTtlMs = 60000) {
    this.capacity = capacity;
    this.defaultTtlMs = defaultTtlMs;
    this.map = new Map();

    // Sentinel dummy nodes to eliminate boundary checks
    this.head = new DoublyLinkedListNode(null, null, Infinity);
    this.tail = new DoublyLinkedListNode(null, null, Infinity);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
  }

  _addToFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    if (this.head.next) this.head.next.prev = node;
    this.head.next = node;
  }

  _moveToFront(node) {
    this._remove(node);
    this._addToFront(node);
  }

  _evictTail() {
    const lruNode = this.tail.prev;
    if (lruNode && lruNode !== this.head) {
      this._remove(lruNode);
      if (lruNode.key !== null) {
        this.map.delete(lruNode.key);
      }
      return lruNode;
    }
    return null;
  }

  get(key) {
    const node = this.map.get(key);
    if (!node) return null;

    if (Date.now() > node.expiresAt) {
      this.delete(key);
      return null;
    }

    this._moveToFront(node);
    return node.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    const expiresAt = Date.now() + ttlMs;

    if (this.map.has(key)) {
      const existingNode = this.map.get(key);
      existingNode.value = value;
      existingNode.expiresAt = expiresAt;
      this._moveToFront(existingNode);
      return;
    }

    if (this.map.size >= this.capacity) {
      this._evictTail();
    }

    const newNode = new DoublyLinkedListNode(key, value, expiresAt);
    this.map.set(key, newNode);
    this._addToFront(newNode);
  }

  delete(key) {
    const node = this.map.get(key);
    if (!node) return false;
    this._remove(node);
    this.map.delete(key);
    return true;
  }

  clear() {
    this.map.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  size() {
    return this.map.size;
  }
}

// Global singleton cache instances
const globalForCache = globalThis;

export const userProfileCache = globalForCache.userProfileCache || new LRUCache(200, 45000); // 45s TTL
export const publicDataCache = globalForCache.publicDataCache || new LRUCache(100, 120000); // 2min TTL
export const rateLimitCache = globalForCache.rateLimitCache || new LRUCache(1000, 60000); // 1min sliding window

if (process.env.NODE_ENV !== 'production') {
  globalForCache.userProfileCache = userProfileCache;
  globalForCache.publicDataCache = publicDataCache;
  globalForCache.rateLimitCache = rateLimitCache;
}
