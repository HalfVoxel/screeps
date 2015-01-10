import Storage.Memory;

class IDManager {

    private static var scId2objs = new Map<String, Entity> ();
	private static var id2objs = new Map<Int, Base> ();
	private static var objs2ref : DynamicObject<Ref<Base>>;

	public static var creeps 			= new Array<AICreep>();
	public static var spawns 			= new Array<AISpawn>();
	public static var defences 			= new Array<AIDefencePosition>();
	public static var sources 			= new Array<AISource>();
	public static var energy 			= new Array<AIEnergy>();
	public static var constructionSites = new Array<AIConstructionSite>();

	public static var structures : Array<Structure> = new Array<Structure>();

	

	public static var loadedObjects : Array<Base>;

	public static var creepQueue : DynamicObject<Dynamic>;

	public static var manager : AIManager;

	public static function tick () {

		if (Game.time == 0) {
			trace("Clearing old data...");
			Memory["counter"] = 0;
			Memory["objects"] = null;
			Memory["refmap"] = null;
			Memory["manager"] = null;
			Memory["creepQueue"] = null;
		}

		// Load ID counter
		if ( Memory["counter"] == null ) {
			Memory["counter"] = 1;
		}

		// Load manager
		manager = Memory["manager"];
		if ( manager == null ) manager = new AIManager ();
		else manager = copyFields(manager, new AIManager());

		// Load objects
		var objects : Array<Dynamic>;
		if ( Memory["objects"] == null ) objects = new Array<Dynamic>();
		else objects = Memory["objects"];

		// Load creep queue
		creepQueue = Memory["creepQueue"];
		if ( creepQueue == null ) creepQueue = new DynamicObject<Dynamic>();

		// Load reference map
		objs2ref = Memory["refmap"];
		if ( objs2ref == null ) objs2ref = new DynamicObject<Ref<Base>>();

		loadedObjects = new Array<Base>();

		// Process creep queue
		var toRemove : Array<String> = [];
		for (queItem in creepQueue.keys()) {
			if (Game.creeps[queItem] != null) {
				var ent = new AICreep();
				addLink (Game.creeps[queItem], copyFields(creepQueue[queItem], ent));
				loadedObjects.push(ent);
				toRemove.push(queItem);
			}
		}
		for (key in toRemove) creepQueue.remove(key);

		var room = Game.getRoom ("1-1").extract();
		// Hacky way to find the current room

		var toDestroy = new Array<Base>();

		for (obj in objects) {
			var ent : Base = cast obj;

			// Right now, ids have not been deserialized, so we have to do this
			var linkStr : String = cast ent.linked;
			var destroyed = bySCID (linkStr != null ? cast linkStr.substring(1,linkStr.length) : null).isNone();

			var ent : Base = Type.createInstance (Type.resolveClass (ent.type), []);
			
			if (ent.isStandalone()) {
				destroyed = false;
			}

			copyFields (obj, ent);

			if (!destroyed) {
				switch(ent.type) {
					case AICreep|CreepEnergyCarrier|Healer: creeps.push (cast ent);
					case AISpawn: spawns.push (cast ent);
					case AISource: sources.push (cast ent);
					case AIEnergy: energy.push (cast ent);
					case AIDefencePosition: defences.push (cast ent);
					case AIConstructionSite: constructionSites.push (cast ent);
					default:
				}
			}

			if (destroyed) {
				trace (Game.time + ": Detected destruction of " + ent.id + " of type " + ent.type);
				toDestroy.push(ent);
			} else {
				id2objs[ent.id] = ent;
				loadedObjects.push(ent);
			}
		}

		rewriteForDeserialization(manager);

		// Make sure all IDs are rewritten to real references
		for (ent in loadedObjects) {
			rewriteForDeserialization(ent);
			ent.manager = manager;

			if (!ent.isStandalone()) {
				// Make sure the 'my' flag is set correctly
				var owned : OwnedEntity = cast ent.linked;
				ent.my = owned.my != null ? owned.my : false;
			}
		}

		// Make sure all IDs are rewritten to real references
		for (ent in toDestroy) {
			rewriteForDeserialization(ent);
			ent.manager = manager;
		}

		// Destroy objects
		for (ent in toDestroy) {
			ent.onDestroyed();
		}

		// Process spawns and create objects for them if none exists
		for (obj in Game.spawns) {
			if (objs2ref[obj.id] == null) {
				addLink(obj, new AISpawn().configure());
			}
		}

		for (obj in room.find(Sources)) {
			if (objs2ref[obj.id] == null) {
				addLink(obj, new AISource().configure());
			}
		}

		structures = cast room.find(Structures);

		// Process construction sites and create objects for them if none exists
		for (obj in room.find(ConstructionSites)) {
			if (objs2ref[obj.id] == null) {
				addLink(obj, new AIConstructionSite().configure());
			}
		}

		for (ob in loadedObjects) {
			ob.earlyTick ();
		}

		//trace ("Loaded " + spawns.length + " " + creeps.length);
	}

	static function rewriteForSerialization (obj : Dynamic) {
		untyped __js__("

		var rec;
		rec = function (obj) {
			for (var key in obj) {
		    	if ( obj.hasOwnProperty(key)) {

		    		var val = obj[key];
		    		if (val != null) {
						if (val.hasOwnProperty('id')) {
							if (typeof(val.id) == 'string') {
								obj[key] = '#' + val.id;
							} else {
								obj[key] = '@' + val.id;
							}
						} else if (val instanceof Array && val.length > 20 && typeof(val[0]) == 'number') {

							var buffer = new ArrayBuffer(val.length*4);
							var floatBuffer = new Float32Array(buffer);
							for (var i = 0; i < val.length; i++ ) {
								floatBuffer[i] = val[i];
							}
							obj[key] = '+' + THREE.Base64.fromArrayBuffer(buffer);
						} else if (typeof(val) == 'object') {
							rec(val);
						}
					}
			    }
			}
	    };
	    rec(obj);
		");
	}

	static function rewriteForDeserialization (obj : Dynamic) {
		untyped __js__("

		var rec;
		rec = function (obj) {
			for (var key in obj) {
		    	if ( obj.hasOwnProperty(key)) {

		    		var val = obj[key];
		    		if (val != null) {

		    			if (typeof(val) == 'string') {
			    			if (val[0] == '#') {
			    				// Screeps ref
								obj[key] = IDManager.bySCID(val.substring(1,val.length));
							} else if ( val[0] == '@' ) {
								// Our ref
								obj[key] = IDManager.byID(parseInt(val.substring(1,val.length)));
							} else if ( val[0] == '+') {
								obj[key] = THREE.Base64.toArrayOfFloats (obj[key].substring(1,val.length));
							}
						} else if (typeof(val) == 'object') {
							rec(val);
						}
					}
			    }
			}
	    };
	    rec(obj);
		");
	}

	//helper function to clone a given object instance
	static function copyFields<T> (from : Dynamic, to : T) {
		untyped __js__("
	    for (var key in from) {
	    	if ( from.hasOwnProperty(key)) {
		        //copy all the fields
		        to[key] = from[key];
		    }
	    }");
	    return to;
	}

	public static function tickEnd () {

		
		Memory["refmap"] = objs2ref;

		var objects = new Array<Dynamic>();
		for (obj in loadedObjects) {
			obj.manager = untyped __js__("undefined");

			rewriteForSerialization(obj);
			objects.push(obj);
		}

		for (obj in creepQueue) {
			obj.manager = untyped __js__("undefined");
			rewriteForSerialization(obj);
		}

		Memory["creepQueue"] = creepQueue;

		Memory["objects"] = haxe.Json.parse (haxe.Json.stringify (objects));

		rewriteForSerialization(manager);
		Memory["manager"] = haxe.Json.parse (haxe.Json.stringify (manager));
		//trace(objects);
	}

	public static function initialize ( obj : Base, register = true ) {
		obj.manager = manager;

		var id : Int = Memory["counter"];
		Memory["counter"] = id+1;
		obj.id = id;

		id2objs[id] = obj;
		if (register) loadedObjects.push (obj);
	}

	public static function queueAddCreep (name : String, creep : AICreep) {
		Memory[name+"_id"] = creep.id;
		trace ("Queing " + creep.id);
		creepQueue[name] = copyFields (creep, {});
	}

	public static function addLink (obj1 : Entity, obj2 : Base) {
		//trace("Added link between " + obj1.id + " " + obj2.id);

		var linkedEntity : Entity = obj2.linked;
		if (linkedEntity != null) throw "The Base object needs to be specifically created for the specified Entity.";

		obj2.linked = obj1;

		objs2ref[obj1.id] = obj2;
		
		var owned : OwnedEntity = cast obj1;
		obj2.my = owned.my != null ? owned.my : false;
	}

	public static function destroy (obj : Base) {
		loadedObjects.remove(obj);
	}

	public static inline function bySCID (id : String) {
		return Game.getObjectById (id);
	}

	public static inline function byID (id : Int) {
		return id2objs[id];
	}

	@:generic
	public static function from<T:Entity, U:Constructible> ( obj : T ) : U {
		if (objs2ref.exists(obj.id)) {
			//trace("Using existing... " + obj.id);
			var lookup : U = cast objs2ref[obj.id].toEntity();
			//trace(lookup + " " + lookup.id + " " + objs2ref[obj.id]);
			return lookup;
		} else {
			//trace("Creating new...");
			var lookup = new U();
			lookup.configure ();
			//trace(lookup + " " + lookup.id);
			addLink(obj, cast lookup);
			return lookup;
		}
	}
}

typedef Constructible = {
	public var id : Int;
	public function new():Void;
	public function configure():Void;
}