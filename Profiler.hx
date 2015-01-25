
/**
 * A simple profiler.
 * From then on you can refer to it through its class name (Profiler).
 * Requires that the debug flag be set, that way I can leave the calls in my code and not worry about it.
 *
 * @author brad
 */
class Profiler
{
	
	private static var instance:Profiler;

	#if debug
	
	// Frame rate tracking
	private var frameTime:Float;
	private var currentFrame:Int;
	
	// How much time the profiler has spent running
	private var selfTime:Float;
	
	// The code sections data
	private var sectionMap:DynamicObject<SectionData>;
	
	private var stack : Array<SectionData>;
	// When (running) profiler code was started (different from instancedAt)
	private var startedAt:Float;
	// When the profiler was instanced/started
	private var instancedAt:Float;
	
	#end
	
	public function new () {

	}

	public static function setInstance ( prof : Profiler ) {
		instance = prof;
	}

	public static function verifyStackZero () {
		if (instance.stack.length != 0) {
			trace ("Profiler stack was not empty");
			trace (instance.stack);
			instance.stack = [];
		}
	}
	public static function getInstance () {
		if ( instance == null ) {
			instance = new Profiler ();
			#if debug
			instance.instancedAt = haxe.Timer.stamp();
			startThis();
			
			instance.sectionMap = new DynamicObject<SectionData>();
			instance.stack = new Array<SectionData>();

			instance.selfTime = 0;
			
			stopThis();
			#end
		}
		return instance;
	}
	
	// Event handlers
	
	// Custom section tracking functions
	
	
	/**
	 * Starts timing for a section. (It will create the section if it doesn't exist.)
	 * @param	section Your reference string for the section.
	 */
	public static #if !debug #end function start( section:String ) {
		#if debug
		startThis();
		var elem = null;
		if ( instance.sectionMap[section] == null ) {
			elem = new SectionData( section );
			instance.sectionMap[section] = elem;
		} else {
			elem = instance.sectionMap[section];
			SectionData.start(elem);
		}
		instance.stack.push (elem);
		stopThis();
		#end
	}
	
	
	/**
	 * Stops timing for a section.
	 * @param	section Your reference string for the section.
	 * @return	If the section exists.
	 */
	public static #if !debug #end function stop() {
		#if debug
		if (instance.stack.length > 0) {
			var elem = instance.stack.pop();
			SectionData.stop (elem);
		} else {
			throw "ERROR: Cannot end profiler here. Stack is empty\n"+haxe.CallStack.toString(haxe.CallStack.callStack());
		}
		#end
	}
	
	
	/**
	 * Returns the total time logged for a section.
	 * @param	section reference string.
	 * @return  time logged.
	 */
	public static #if !debug #end function get( section:String ) : Float {
		#if debug
		startThis();
		if ( instance.sectionMap[section] != null ) 
			return SectionData.time(instance.sectionMap[section]);
		stopThis();
		
		#end
		return 0;
	}
	
	
	
	// Internal functions
	
	#if debug
	
	/**
	 * Start the clock for the internal time log.
	 * This should be called at the beginning of every entry point to the class,
	 * Including event handlers.  (But not in functions who can/will only be 
	 * called from other in-class functions.)
	 */ 
	private static inline function startThis() {
		instance.startedAt = haxe.Timer.stamp();
	}
	
	
	/**
	 * Stop the clock for the internal time log. 
	 * Should be called at the end of every function who calls startThis();
	 */
	private static inline function stopThis() {
		instance.selfTime += haxe.Timer.stamp() - instance.startedAt;
	}
	
	#end
	
	public static function tick () {
		#if debug
		for (v in instance.sectionMap) {
			v.thisTick = 0;
		}
		#end
	}

	public static inline function clamp( min:Float, val:Float, max:Float )  : Float {
		return min > val ? min : max < val ? max : val;
	}
	
	public static function toString () {
		var s = "";
		#if debug
		for (v in instance.sectionMap) {
			s += SectionData.toString(v) + "\n";
		}
		#end
		return s;
	}

	public static function toStringThisTick () {
		var s = "";
		#if debug
		for (v in instance.sectionMap) {
			s += SectionData.toStringThisTick(v) + "\n";
		}
		#end
		return s;
	}
}

#if debug

class SectionData {
	
	private var name:String;
	private var startTime:Float;
	private var totalTime:Float;
	private var counter:Int;
	public var thisTick:Float;

	public function new ( name:String ) {
		this.name = name;
		totalTime = 0;
		counter = 0;
		start(this);
	}
	
	public static inline function stop( v : SectionData ) {
		var time = (haxe.Timer.stamp() - v.startTime );
		v.thisTick += time;
		v.totalTime += time;
		v.counter++;
	}
	
	public static inline function start( v : SectionData ) {
		v.startTime = haxe.Timer.stamp();
	}
	
	public static inline function time( v : SectionData ) {
		return v.totalTime;
	}
	
	public static inline function toString( v : SectionData ) {
		return v.name + ":\t\t" + Math.round (v.totalTime*1000) + "\t Average: " + Math.round ((v.totalTime/v.counter)*1000);
	}

	public static inline function toStringThisTick( v : SectionData ) {
		return v.name + ":\t\t" + Math.round (v.thisTick*1000);
	}
}

#end
