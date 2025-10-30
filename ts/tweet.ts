class Tweet {
	private text:string;
	time:Date;

    constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time); //, "ddd MMM D HH:mm:ss Z YYYY"
    } 

    //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    //  the tweet category based on key phrases
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        const t = this.text.toLowerCase();

        // achievements 
        const achievementPatterns = [
            /achiev(ed|ement)/i,
            /personal\s*record|\bpr\b/i,
            /new\s*(longest|fastest|furthest)/i,
            /set\s+a\s+goal/i,
            /reached\s+(my\s+)?goal/i,
            /milestone/i
        ];

        // completed activity 
        const completedPatterns = [
            /just\s*completed/i,
            /just\s*posted/i,
            /just\s*finished/i,
            /completed\s+(an?\s+)?\d/i,
            /finished\s+(an?\s+)?\d/i
        ];

        // live activity 
        const livePatterns = [
            /just\s*started/i,
            /watch\b/i,
            /live\b/i,
            /cheer\s*me\s*on/i,
            /starting\s+(a|my)\b/i,
            /on\s+(a|my)\s+(run|ride|walk|bike)/i
        ];

        if (achievementPatterns.some(p => p.test(t))) {
            return "achievement";
        }
        if (completedPatterns.some(p => p.test(t))) {
            return "completed_event";
        }
        if (livePatterns.some(p => p.test(t))) {
            return "live_event";
        }
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    //  if a completed tweet has additional user-written text 
    get written():boolean {
        //TODO: identify whether the tweet is written
        if (this.source !== "completed_event") {
            return false;
        }

        let clean = this.text;
        // remove urls, hashtags 
        clean = clean.replace(/https?:\/\/\S+/gi, "");
        clean = clean.replace(/#\w+/g, "");
        // remove runKeeper phrases
        clean = clean.replace(/\b(with|via|on)\s+@runkeeper\.?/gi, "");
        // remove common phrases
        clean = clean.replace(/check it out!?/gi, "");
       
        clean = clean.replace(/just\s*(completed|posted|finished)\s+an?\s*\d+\.?\d*\s*(km|mi|miles?|kilometers?)\s+[a-z][a-z\- ]*?(?=(\s+(with|via|on)\s+@runkeeper|\s*[–—-]\s|\.|$))/gi, "");
        // if without distance
        clean = clean.replace(/just\s*(completed|posted|finished)\s+(an?\s+)?[a-z][a-z\- ]*?(?=(\s+(with|via|on)\s+@runkeeper|\s*[–—-]\s|\.|$))/gi, "");
        // clean spaces and separators
        clean = clean.replace(/\s*[–—-]\s*/g, " ");
        clean = clean.replace(/[\.|!]+\s*$/g, "");
        clean = clean.replace(/\s+/g, " ").trim();

        return /[a-z0-9]/i.test(clean);
    }

    // returns only the user-written text
    get writtenText():string {
        if(!this.written) {
            return "";
        }
        //TODO: parse the written text from the tweet
        let clean = this.text;
        clean = clean.replace(/https?:\/\/\S+/gi, "");
        clean = clean.replace(/#\w+/g, "");
        clean = clean.replace(/\b(with|via|on)\s+@runkeeper\.?/gi, "");
        clean = clean.replace(/check it out!?/gi, "");
        clean = clean.replace(/just\s*(completed|posted|finished)\s+an?\s*\d+\.?\d*\s*(km|mi|miles?|kilometers?)\s+[a-z][a-z\- ]*?(?=(\s+(with|via|on)\s+@runkeeper|\s*[–—-]\s|\.|$))/gi, "");
        clean = clean.replace(/just\s*(completed|posted|finished)\s+(an?\s+)?[a-z][a-z\- ]*?(?=(\s+(with|via|on)\s+@runkeeper|\s*[–—-]\s|\.|$))/gi, "");
        clean = clean.replace(/\s*[–—-]\s*/g, " ");
        clean = clean.replace(/[\.|!]+\s*$/g, "");
        return clean.replace(/\s+/g, " ").trim();
    }

    //  activity type for completed tweets
    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        const text = this.text.toLowerCase();

        function normalizeActivity(raw:string):string {
            const name = raw.trim().toLowerCase()
                .replace(/[^a-z\s-]/g, "")
                .replace(/\s+/g, " ");

            // running 
            if (/(treadmill|tm)\s*run/.test(name)) return "treadmill running";
            if (/trail\s*run(ning)?/.test(name)) return "trail running";
            if (/(road|street)\s*run(ning)?/.test(name)) return "road running";
            if (/run|jog(ging)?/.test(name)) return "running";

            // walking
            if (/hike|hiking/.test(name)) return "hiking";
            if (/(nordic|power)\s*walk(ing)?/.test(name)) return "nordic walking";
            if (/(treadmill|tm)\s*walk(ing)?/.test(name)) return "treadmill walking";
            if (/walk(ing)?/.test(name)) return "walking";

            // cycling 
            if (/(mountain\s*bike|mtb)/.test(name)) return "mountain biking";
            if (/(indoor\s*cycling|spin(ning)?|spin\s*class)/.test(name)) return "spinning";
            if (/(road\s*cycle|road\s*bike)/.test(name)) return "road cycling";
            if (/cycle|cycling|bike|biking/.test(name)) return "cycling";

            //  water
            if (/swim(ming)?/.test(name)) return "swimming";
            if (/row(ing)?|crew/.test(name)) return "rowing";
            if (/kayak(ing)?/.test(name)) return "kayaking";
            if (/canoe(ing)?/.test(name)) return "canoeing";
            if (/(sup|stand\s*up\s*paddle)/.test(name)) return "stand up paddle";
            if (/surf(ing)?/.test(name)) return "surfing";

            // snow ice
            if (/(xc|cross[-\s]?country)\s*ski(ing)?/.test(name)) return "cross-country skiing";
            if (/roller\s*ski(ing)?/.test(name)) return "roller skiing";
            if (/ski(ing)?/.test(name)) return "skiing";
            if (/snowboard(ing)?/.test(name)) return "snowboarding";
            if (/(ice\s*)?skate(ing)?/.test(name)) return "ice skating";

            // gym or conditioning
            if (/elliptical/.test(name)) return "elliptical";
            if (/stair(\s*master)?|stairs/.test(name)) return "stairs";
            if (/(strength|weight|weights|lift(ing)?|barbell|dumbbell)/.test(name)) return "strength training";
            if (/crossfit/.test(name)) return "crossfit";
            if (/hiit|intervals?/.test(name)) return "interval training";
            if (/circuit/.test(name)) return "circuit training";
            if (/boxing|kickbox(ing)?/.test(name)) return "boxing";
            if (/(martial\s*arts|karate|judo|tae\s*kwon|tkd|bjj|jiu[-\s]*jitsu)/.test(name)) return "martial arts";
            if (/yoga/.test(name)) return "yoga";
            if (/pilates/.test(name)) return "pilates";

            // field or court
            if (/soccer/.test(name)) return "soccer";
            if (/(american\s*)?football/.test(name)) return "american football";
            if (/basketball/.test(name)) return "basketball";
            if (/tennis/.test(name)) return "tennis";
            if (/volleyball/.test(name)) return "volleyball";
            if (/badminton/.test(name)) return "badminton";
            if (/pickleball/.test(name)) return "pickleball";
            if (/cricket/.test(name)) return "cricket";
            if (/(soft|base)ball/.test(name)) return "baseball";
            if (/rugby/.test(name)) return "rugby";
            if (/hockey/.test(name)) return "hockey";
            if (/lacrosse/.test(name)) return "lacrosse";
            if (/handball/.test(name)) return "handball";
            if (/(table\s*)?tennis|ping[-\s]*pong/.test(name)) return "table tennis";
            if (/squash|racquetball/.test(name)) return "squash";
            if (/golf/.test(name)) return "golf";
            if (/frisbee|ultimate/.test(name)) return "ultimate frisbee";

            // other
            if (/(inline )?skate(ing)?|rollerblade(ing)?/.test(name)) return "skating";
            if (/skateboard(ing)?/.test(name)) return "skateboarding";
            if (/climb(ing)?|bouldering/.test(name)) return "climbing";
            if (/mountaineer(ing)?/.test(name)) return "mountaineering";
            if (/orienteer(ing)?/.test(name)) return "orienteering";
            if (/(horse|equestrian)\s*(ride|riding)/.test(name)) return "horseback riding";
            if (/triathlon/.test(name)) return "triathlon";
            if (/duathlon/.test(name)) return "duathlon";
            if (/hand\s*(cycle|cycling)|handbike|hand\s*bike/.test(name)) return "handcycling";
            if (/wheelchair/.test(name)) return "wheelchair";
            if (/workout|training|exercise/.test(name)) return "workout";
            const firstToken = (name.split(" ")[0] || "").trim();
            const blacklist = new Set([
                "mysports","just","a","an","the","with","and","for","of",
                "morning","evening","afternoon","night","great","awesome","good",
                "cool","nice","quick","easy","hard","fast","slow","my"
            ]);
            if (firstToken.length === 0 || blacklist.has(firstToken)) {
                return "other";
            }
            return firstToken;
        }

        // try the primary pattern: distance then activity phrase
        const distanceThenActivity = text.match(/just\s+(completed|posted)\s+a\s+[^\d]*\d+\.?\d*\s*(km|mi|miles?|kilometers?)\s+([a-z][a-z\- ]+)/i);
        if (distanceThenActivity && distanceThenActivity[3]) {
            return normalizeActivity(distanceThenActivity[3]);
        }

        // handle the case completed without a distance
        const completedNoDistance = text.match(/just\s+(completed|finished)\s+(?:an?\s+)?(.+?)\s+(?:with\s+@runkeeper|https?:\/\/t\.co\/\w+)/i);
        if (completedNoDistance && completedNoDistance[2]) {
            return normalizeActivity(completedNoDistance[2]);
        }

        // fallback (map to the expanded set)
        if (/(treadmill|tm)\s*run/.test(text)) return "treadmill running";
        if (/trail\s*run/.test(text)) return "trail running";
        if (/ run |km run|mi run|mile run/.test(text)) return "running";
        if (/ hike|km hike|mi hike|hiking/.test(text)) return "hiking";
        if (/(nordic|power)\s*walk/.test(text)) return "nordic walking";
        if (/(treadmill|tm)\s*walk/.test(text)) return "treadmill walking";
        if (/ walk|km walk|mi walk|mile walk/.test(text)) return "walking";
        if (/(mountain\s*bike|mtb)/.test(text)) return "mountain biking";
        if (/spinning|spin\s*class/.test(text)) return "spinning";
        if (/ road\s*(cycle|bike)/.test(text)) return "road cycling";
        if (/ bike|km bike|mi bike|cycling|cycle/.test(text)) return "cycling";
        if (/ swim|km swim|mi swim/.test(text)) return "swimming";
        if (/row|crew/.test(text)) return "rowing";
        if (/kayak/.test(text)) return "kayaking";
        if (/canoe/.test(text)) return "canoeing";
        if (/(xc|cross[-\s]?country).*ski|\bski(ing)?\b/.test(text)) return /(xc|cross[-\s]?country)/.test(text) ? "cross-country skiing" : "skiing";
        if (/roller\s*ski/.test(text)) return "roller skiing";
        if (/snowboard/.test(text)) return "snowboarding";
        if (/ice\s*skate|skating/.test(text)) return "ice skating";
        if (/elliptical/.test(text)) return "elliptical";
        if (/stair|stairs/.test(text)) return "stairs";
        if (/strength|weights|lift|barbell|dumbbell/.test(text)) return "strength training";
        if (/crossfit/.test(text)) return "crossfit";
        if (/hiit|interval/.test(text)) return "interval training";
        if (/circuit/.test(text)) return "circuit training";
        if (/boxing|kickbox/.test(text)) return "boxing";
        if (/martial|karate|judo|bjj|jiu/.test(text)) return "martial arts";
        if (/yoga/.test(text)) return "yoga";
        if (/pilates/.test(text)) return "pilates";
        if (/soccer/.test(text)) return "soccer";
        if (/(american\s*)?football/.test(text)) return "american football";
        if (/basketball/.test(text)) return "basketball";
        if (/tennis/.test(text)) return "tennis";
        if (/volleyball/.test(text)) return "volleyball";
        if (/badminton/.test(text)) return "badminton";
        if (/pickleball/.test(text)) return "pickleball";
        if (/cricket/.test(text)) return "cricket";
        if (/golf/.test(text)) return "golf";
        if (/(table\s*)?tennis|ping[-\s]*pong/.test(text)) return "table tennis";
        if (/squash|racquetball/.test(text)) return "squash";
        if (/frisbee|ultimate/.test(text)) return "ultimate frisbee";
        if (/climb|boulder/.test(text)) return "climbing";
        if (/(sup|stand\s*up\s*paddle)/.test(text)) return "stand up paddle";
        if (/surf/.test(text)) return "surfing";
        if (/skateboard/.test(text)) return "skateboarding";
        if (/(inline )?skate|rollerblade/.test(text)) return "skating";
        if (/hand\s*(cycle|cycling)|handbike|hand\s*bike/.test(text)) return "handcycling";
        if (/wheelchair/.test(text)) return "wheelchair";
        if (/workout|training|exercise/.test(text)) return "workout";

        return "other";
    }

  
    get detailedActivityType():string {
        if (this.source !== 'completed_event') {
            return 'unknown';
        }
        const text = this.text.toLowerCase();
        // distance then activity 
        const distThenAct = text.match(/just\s+(completed|posted)\s+a\s+[^\d]*\d+\.?\d*\s*(km|mi|miles?|kilometers?)\s+([a-z][a-z\- ']+)/i);
        let candidate = distThenAct && distThenAct[3] ? distThenAct[3] : '';
        if (!candidate) {
            // completed without distance 
            const noDist = text.match(/just\s+(completed|finished)\s+(?:an?\s+)?(.+?)\s+(?:with\s+@runkeeper|https?:\/\/t\.co\/\w+)/i);
            candidate = noDist && noDist[2] ? noDist[2] : '';
        }
        if (!candidate) {
            return this.activityType; // fallback to normalized
        }
        candidate = candidate
            .replace(/#\w+/g, '')
            .replace(/@\w+/g, '')
            .replace(/[^a-z\- ']/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (!candidate || candidate.length < 3) {
            return this.activityType;
        }
        return candidate;
    }

    // parses distance and converts km to miles 
    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        const distanceMatch = this.text.match(/(\d+\.?\d*)\s*(km|mi|miles?|kilometers?)/i);
        if (!distanceMatch) {
            return 0;
        }
        
        const distance = parseFloat(distanceMatch[1]);
        const unit = distanceMatch[2].toLowerCase();
        
        if (unit.includes('km') || unit.includes('kilometer')) {
            return distance * 0.621371; 
        } else {
            return distance; 
        }
    }

    //  sentiment score on user-written text
    get sentimentScore(): number {
        const text = (this.writtenText || '').toLowerCase();
        if (!text) return 0;
        const tokens = text.match(/[a-z]+/g) || [];
        // Fallback mini lexicon; will be overridden if window.POSITIVE_WORDS/NEGATIVE_WORDS exist
        const fallbackPos = new Set(['great','good','awesome','amazing','nice','fun','happy','love','strong','fast','better','best','beautiful','enjoy','proud']);
        const fallbackNeg = new Set(['bad','tired','hurt','pain','slow','worst','injured','sick','hate','boring','hard','sad','frustrated']);
        const pos:any = (window as any).POSITIVE_WORDS || fallbackPos;
        const neg:any = (window as any).NEGATIVE_WORDS || fallbackNeg;
        let score = 0;
        for (const w of tokens) {
            if (pos.has(w)) score += 1;
            if (neg.has(w)) score -= 1;
        }
        return score;
    }

    // maps the score to a sentiment label
    get sentimentLabel(): string {
        const s = this.sentimentScore;
        return s > 0 ? 'positive' : s < 0 ? 'negative' : 'neutral';
    }

    //TODO: return a table row which summarizes the tweet with a clickable link to the runkeeper activity
    // renders  table row 
    getHTMLTableRow(rowNumber:number):string {
        const urlMatch = this.text.match(/https:\/\/t\.co\/\w+/);
        const url = urlMatch ? urlMatch[0] : "#";
        
        return `<tr>
            <td>${rowNumber}</td>
            <td>${this.activityType}</td>
            <td>${this.text.replace(/https:\/\/t\.co\/\w+/, `<a href="${url}" target="_blank">${url}</a>`)}<br/><small>Sentiment: ${this.sentimentLabel}</small></td>
        </tr>`;
    }
}