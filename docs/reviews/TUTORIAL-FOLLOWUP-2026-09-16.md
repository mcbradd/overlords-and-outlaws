# Tutorial follow-up observations — September 16, 2026

This was a bounded follow-up by a familiar reviewer, after completing the earlier blind tutorial. It is not a second fresh-player test and is not evidence from an actual child. I used plain reading and reasoning as an adult agent surrogate. The tested page was the frozen local build at http://127.0.0.1:5192/. I started the tutorial fresh, completed steps 1–21 through Trade, left through “Play freely from this position,” then made two paid decisions and a Pass. I stopped there as requested; I did not finish this match.

All observations came from rendered browser UI, screenshots, visible controls and ordinary card inspection. I did not read source, files, hidden state, storage, network, console, game internals or other agents’ work. No hint, suggestion, recommended-plan or “Advice from your visible information” control was used. This report was written only after the check ended.

## Outcome

The opening now explains the overall win path immediately. Guided card choices require explicit selections, with counts and disabled confirmation until the requested selection is complete. The Trade now has an understandable family tradeoff, hides the rival offer until both players consent, displays the actual offered cards, and reports each consent/acceptance stage separately. Free play was reachable from the same table and offered real target choices with readable costs and a review screen. There was no hard blocker in this bounded check.

The main remaining friction was repeated internal guide scrolling and scroll position resetting after selection. Free play also contained a concrete wording conflict: at zero seals it said both that Block costs one and “You can still Block.” Strategy remained less clear than button operation: I could not confidently identify which rival Noble was required for its Crown claim.

## Chronological observations

### Opening and first picks

The title page said, “Build your family. Claim the Crown. Pass it to an heir—and protect them to win.” The private handoff text identified the other players as computer rivals. These answered the goal and seating questions earlier than the baseline.

Step 1 repeated: “To win: claim the Crown, pass it to an heir (your chosen next Ruler), then keep that new Ruler for a full round. First, build a Court of 3 Nobles from one family.” Its heading was “Build a family that can win the Crown.” It explained a Noble as a person card and Dynasty as a family name. I could say why matching family names mattered before making the first pick.

It also said, “This teaching deal follows set choices; you can play freely from the same table whenever you want.” The label was “GUIDED EXAMPLE · YOUR TURN.” This accurately described what I was doing. I was following a prescribed example, not independently deciding the best draft.

The guide offered explicit checkboxes and a 0/3 count. Confirmation was unavailable until the requested cards were selected. Matching hand cards had gold highlighting. I selected the requested cards from the guide list.

A repeated interaction problem appeared: selecting a guide checkbox reset the guide’s internal scroll to the top. After selecting Richard in a scrolled panel, I tried the next card at its previous screen position. That click hit text because the panel had moved; Elizabeth remained unselected. I recovered by scrolling and checking the count. No wrong game action was committed. This makes repeated selection slower and encourages missed clicks. The guide also has its own scrollbar inside the page’s scrollbar; at the approximately 2048-by-993 viewport I repeatedly had to scroll to reach selections, outcomes or continuation. Parts of the hand were below the fold.

### Draft, Court and Ruler

Step 4 said, “Keep Kenneth, Margaret and David: all three say Alba. This example passes Alexander II and Edward II. In a normal game, other choices may be better; extra Alba cards can help defend Alba later.” That makes the limitation of the example explicit. I would not count those prescribed passes as voluntary strategic mistakes by the player.

Outcome panels now included multiple changes, such as a rival confirming picks, the number of Nobles I received, and packets passing clockwise. This was more informative than a stale single message. One small grammar issue was “You receive 1 Nobles.”

Step 10 defined the Court when declaring it and required explicit selection of three named cards. Step 13 required selecting Kenneth before Appoint became available and displayed “Free · no seal spent now.” It explained that appointing a Ruler was not itself winning. I understood that I was making a leader, not claiming the Crown.

These steps still prescribed the named selection. Their value was learning the interaction and seeing its consequences. They were not evidence that I could choose the strongest opening Court or Ruler unaided. The explicit example label and free-play exit made that distinction clearer.

### History and Trade preparation

Step 15 explained one History card per player, three at this table, and the shared danger of a complete six-piece painting. After resolving it, the outcome listed the round start and each revealed card. Visible text included: “Round 1 starts. Lent Nobles return to their hands and sideways Nobles turn upright. History reveals 3 cards after any Ruler change and active Crisis effects.” The list also showed the Ruler appointment, Contested Recognition, Border Rising and the Alba painting reveal. I had to scroll to read the whole outcome, but the information was there.

My hand contained Robert the Bruce, Alexander III, Malcolm III, William the Lion and Robert II, all Alba. Step 16, “Trade a family card for a new option,” said: “Your hand contains only Alba Nobles. Offer Robert II to The Lion. A card from another Dynasty could marry Margaret or help you take a rival’s Noble. Giving up Robert means one fewer Alba card for your own Court or defense.”

I could explain the tradeoff: keep a family card to build or defend my side, or gain another family’s card to do things against or with them. That is a concrete reason to trade. I still was not independently choosing the offer because the example named Robert II.

I explicitly selected Robert II; Offer Trade was unavailable before selection. The cost was “One seal only if both accept.” The explanation said, “Pay 1 seal only if both accept. If either refuses, keep your cards; anything seen stays known.” Offering produced “You offer 1 hand Noble to The Lion.” My seals were still three.

### Trade privacy and acceptance, steps 17–21

Step 17 was “The Lion chooses a hidden offer.” It said, “The Lion chooses which card to offer without seeing yours.” I was not told the rival card’s name at this point. Resolving produced: “The offer is now set aside face down. Both players must agree before seeing it.”

Step 18 was “Agree to look at the offers.” It said both players must agree before either sees the other’s cards and that agreeing to look did not accept the exchange or spend a seal. I clicked Agree to look. The outcome said: “Your agreement to look is recorded. The other player must also agree before either offer is shown.” No rival name was revealed yet.

Step 19 was “The Lion agrees to look.” After resolving its agreement, the outcome said, “Both parties inspect the locked packets privately.” Now two actual cards appeared under “You give” and “You receive”: Alba Robert II and Plantagenet Richard I, with portraits, family names, names and Inspect controls. I scrolled them fully into view. This directly addressed the baseline’s absent-card comparison. I could compare what was leaving and arriving.

Step 20, “Accept this exchange,” explained: “Compare the two offers below. Richard is Plantagenet; Robert is Alba. Richard gives you a foreign spouse for Margaret or a way to Recall a Plantagenet rival. Robert is more useful for defending Alba. This example accepts; playing freely also lets you decline.” This gave the reason for the example and admitted that refusing is a real option outside it.

The acceptance cost line was “Free · no seal spent now,” accompanied by “You pay 1 seal only if you both accept.” I understood the timing from the nearby explanation, though the isolated bold word “Free” could be skimmed as the whole trade being free. I clicked Accept exchange. The outcome changed to: “Your decision is recorded. The trade waits for the other player’s decision. No cards have moved yet.” The offered cards remained visible.

Step 21 was “Two accepts.” It explained that only I pay because I started the Trade. Resolving showed “Your seals: 3 → 2. Keep a seal for Block if you need to defend,” “You and The Lion complete their exchange,” and “The locked packets exchange simultaneously.” Robert II was replaced by Richard I in my hand. This matched my prediction. The short board caption remained the earlier offer message during intermediate trade stages, but the guide’s stage-specific outcome resolved the previous confusion. I completed Trade without a hard blocker.

### Leaving the guide

I used “Play freely from this position” after completing step 21. The guide disappeared and the same cards/resources remained. “THE LION’S OPPORTUNITY” and “A rival considers the table” appeared. I resolved ordinary rival turns without enabling automatic continuation.

The Lion claimed the Crown. The visible result said it must change Ruler at the start of round 2 and keep the new Ruler for one full round to win. The Rose then tried to Recall Henry II; The Lion blocked. Henry II was labeled “SAFE FROM RECALL THIS ROUND.”

### Independent decision 1: Recall

My turn offered action categories and “2 seals left. Each action or Block costs 1. Pass is free.” Recruit was initially selected. I chose Recall because The Lion had claimed the Crown and I now had a Plantagenet card. The interface said a rival could break the claim by taking a required Noble.

Recall offered John or Henry III using Richard I. Each named the loan, destination and one-seal cost. Henry II was absent; its visible protection label explained why. I chose Henry III to reduce The Lion’s Court. I was uncertain whether this would break the claim: the explanation specifically mentioned a Ruler or required heir, and I could not identify a required heir on this table. This was a real strategic uncertainty in my own chosen move.

The review screen said: “Lend Richard I face up until next round. If not Blocked, Henry III moves into your hand.” It also said the rival could spend a seal and matching hand card to Block, and that my seal stayed spent and lent card returned next round. I confirmed knowing failure was possible. The seal count fell from two to one, and Richard became a visible loan. The Lion blocked. “The Block prevents the transfer. Both commitments remain until next round” matched the preview. I did not get Henry III; the Crown remained claimed. Target choice and cost were understandable even though I was unsure of the target’s strategic value.

### Independent decision 2: Challenge

The Lion passed, and The Rose used Henry VII to add the first of two Challenges to Border Rising. I had one seal left. I inspected the visible Border Rising card. It explained that two different ready Court Nobles could prevent it and that otherwise players with Rulers would retire another Bloodline Noble at round start. Its glossary explained ready/upright, Bloodline, The Past and Challenge.

I chose to spend my last seal preventing that known loss, accepting that I would have no seal for Block. I selected Challenge. The interface offered Kenneth, Margaret and David individually, each with the crisis name and cost. I chose David to leave my Ruler and Margaret upright. I did not know whether this choice of Noble had another benefit beyond readiness; I had not proven it was best.

The preview said to turn David sideways and add “1 of 2 contributions.” I knew the existing count was one, so predicted this would finish prevention. I confirmed. David was marked SIDEWAYS, my seal count became zero, the Border Rising warning disappeared, and the result was “Border Rising is averted.” This matched my prediction. “Add 1 of 2” describes the contribution size but does not explicitly preview the new total of two; the completion was clear afterward.

### Final sample: Pass

After further rival actions, I had zero seals and only Pass was offered. The same screen said “0 seals left. Each action or Block costs 1. Pass is free,” but also “Keep your remaining seals and let the next player act. You can still Block.” Those sentences conflict for this position. The resources told me I could not pay for Block. I captured a screenshot with both statements visible.

I chose Pass because I had no paid options. A first coordinate click missed after the page scroll moved; inspection showed the Pass still available, and I used the visible control successfully. The review screen said free/no seal spent. Confirming produced “You pass. 1 consecutive pass.” This was correct button progression, not an interesting strategic choice at zero resources. I stopped here as the bounded check required.

## What I could explain afterward

- Build one family in the Court, appoint a leader, claim the Crown, then complete and protect the change to an heir according to the Law.
- Family cards have value in my Court or defense; another family’s card can create marriage or Recall options.
- Trade has separate choices to look and to swap. Both players must agree, and the initiator pays one seal only for a completed exchange.
- Recall names a loan and target, can be blocked, and still spends the attacking seal if blocked.
- Challenge uses a ready Court Noble and a seal; different players can contribute toward preventing a shared crisis.
- Spending my last seal removes my ability to pay for another action or Block. Pass costs nothing.

I still could not confidently choose the best draft, compare long-term Crown plans, identify this rival’s required heir from the ordinary board, or explain all strategic effects of choosing one ready Noble over another. The follow-up supports improved comprehension of the tested actions, not mastery of the game or proof that an actual new child player would succeed.

## Remaining friction and evidence

No hard blocker occurred. The most concrete remaining comprehension defect was the zero-seal promise that I could still Block. Repeated guide scroll resets were the strongest interaction friction; they caused a missed checkbox click and substantial rescrolling. The repeated goal and full offered cards were useful but made the guide tall. Board labels and cards remained small at the whole-table view, and the hand often began below the fold. Guided selections were explicit but prescribed; free play provided genuine alternatives.

Screenshots were captured in the browser-tool transcript throughout the check, including the opening/selection state, History multi-event outcome, hidden offer before consent, actual Robert II/Richard I comparison after consent, Trade completion with seals 3→2, free-play Recall alternatives and Henry II protection, Border Rising inspection, three Challenge target alternatives, successful crisis prevention, and the zero-seal/“You can still Block” contradiction. No screenshot files were separately exported.
