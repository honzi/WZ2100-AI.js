function eventAttacked(victim, attacker){
    if(me !== victim.player){
        return;
    }
}

function eventChat(sender, to, message){
}

function eventDesignCreated(template){
}

function eventDestroyed(gameObject){
}

function eventDroidBuilt(droid, structure){
}

function eventDroidIdle(droid){
}

function eventObjectSeen(sensor, gameObject){
}

function eventPickup(item, droid){
}

function eventResearched(research, structure){
}

function eventStartLevel(){
    chat(
      ALL_PLAYERS,
      "glhf"
    );
}

function eventStructureBuilt(structure, droid){
}

function eventStructureReady(structure){
}
