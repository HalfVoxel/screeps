package com.gigglingcorpse.utils;
import nme.display.Sprite;
import nme.events.Event;
import nme.Lib;
import nme.text.TextField;
import nme.text.TextFormat;

/**
 * A simple profiler.
 * From then on you can refer to it through its class name (Profiler).
 * Requires that the debug flag be set, that way I can leave the calls in my code and not worry about it.
 *
 * @author brad
 */
class Profiler
{
	
	#if debug
	
	private static var instance:Profiler;
	
	// Frame rate tracking
	private var frameTime:Float;
	private var currentFrame:Int;
	
	// How much time the profiler has spent running
	private var selfTime:Float;
	
	// The code sections data
	private var sectionMap:Hash<SectionData>;
	
	// When (running) profiler code was started (different from instancedAt)
	private var startedAt:Float;
	// When the profiler was instanced/started
	private var instancedAt:Float;
	
	#end
	
	public function new () {
		#if debug
		if ( instance == null ) {
			super();
			instance = this;
			instancedAt = Lib.getTimer();
			startThis();
			
			sectionMap = new Hash<SectionData>();
			selfTime = 0;
			
			stopThis();
			return this;
			
		} else {
			return instance;
		}
		#else
		super();
		#end
	}
	
	// Event handlers
	
	// Custom section tracking functions
	
	
	/**
	 * Starts timing for a section. (It will create the section if it doesn't exist.)
	 * @param	section Your reference string for the section.
	 */
	public static #if !debug inline #end function start( section:String ) {
		#if debug
		startThis();
		if ( !instance.sectionMap.exists( section ) ) {
			instance.sectionMap.set( section, new SectionData( section ) );
		} else instance.sectionMap.get( section ).start();
		instance.stopThis();
		#end
	}
	
	
	/**
	 * Stops timing for a section.
	 * @param	section Your reference string for the section.
	 * @return	If the section exists.
	 */
	public static #if !debug inline #end function stop( section:String ) : Bool{
		#if debug
		startThis();
		var r = false;
		if ( instance.sectionMap.exists( section ) ) {
			instance.sectionMap.get( section ).stop();
			r = true;
		}
		instance.stopThis();
		return r;
		
		#else
		
		return false;
		#end
	}
	
	
	/**
	 * Returns the total time logged for a section.
	 * @param	section reference string.
	 * @return  time logged.
	 */
	public static #if !debug inline #end function get( section:String ) : Float {
		#if debug
		startThis();
		if ( instance.sectionMap.exists( section ) ) 
			return instance.sectionMap.get( section ).time();
		instance.stopThis();
		
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
		if ( instance == null ) 
			instance = new Profiler();
		instance.startedAt = Lib.getTimer();
	}
	
	
	/**
	 * Stop the clock for the internal time log. 
	 * Should be called at the end of every function who calls startThis();
	 */
	private inline function stopThis() {
		instance.selfTime += Lib.getTimer() - instance.startedAt;
	}
	
	#end
	
	public static inline function clamp( min:Float, val:Float, max:Float )  : Float {
		return min > val ? min : max < val ? max : val;
	}
	
}

#if debug

class SectionData {
	
	private var name:String;
	private var startTime:Float;
	private var totalTime:Float;
	
	public function new( name:String ) {
		this.name = name;
		totalTime = 0;
		start();
	}
	
	public inline function stop() {
		totalTime += (Lib.getTimer() - startTime );
	}
	
	public inline function start() {
		startTime = Lib.getTimer();
	}
	
	public inline function time() {
		return totalTime;
	}
	
	public inline function toString() {
		return name + ":\t" + totalTime;
	}
}

#end
