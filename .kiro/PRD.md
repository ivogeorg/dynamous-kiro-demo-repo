Will contain the requirements and tasks. Format in MoSCoW (Must-have, Should-have, Could-have, Won't-have) and EARS (Easy Approach to Requirements Syntax) be used together to format a PRD.  

Some notes:
Yes, MoSCoW and EARS can be used together to format a Product Requirements Document (PRD). In fact, combining them is a highly effective way to create a clear, prioritized, and well-structured set of requirements. 
EARS (Easy Approach to Requirements Syntax) dictates how to write each requirement (the syntax/structure) to ensure clarity and reduce ambiguity.
MoSCoW (Must-have, Should-have, Could-have, Won't-have) dictates the priority of each requirement to guide development focus and resource allocation. 
Here is how they are combined, why they work together, and an example.
How to Combine MoSCoW and EARS in a PRD
You can apply MoSCoW priorities to EARS-formatted requirements within the "Functional Requirements" section of a PRD. 
1. Structure the Requirement (EARS)
Use EARS to write clear, actionable requirements that prevent ambiguity. EARS typically follows these structures: 
Ubiquitous Requirement: "The [system] shall [do something]."
Event-Driven Requirement: "When [trigger], the [system] shall [system response]."
State-Driven Requirement: "While [state], when [trigger], the [system] shall [system response]." 
2. Prioritize the Requirement (MoSCoW)
Assign a MoSCoW tag to each requirement to indicate its necessity: 
M (Must-have): Essential for MVP, non-negotiable.
S (Should-have): High-priority but not vital.
C (Could-have): Desirable, "nice-to-have".
W (Won't-have): Agreed not to be included in the current release. 
Example Combined Structure in a PRD
ID 	Requirement (EARS Syntax)	Priority (MoSCoW)
FR-01	When the user clicks "Submit", the System shall save the input data.	Must-have
FR-02	While the user is on the checkout page, the System shall display a progress bar.	Should-have
FR-03	If the user is a premium member, the System shall allow them to export data to CSV.	Could-have
Benefits of Using Them Together
Clarity + Prioritization: EARS ensures requirements are unambiguous, while MoSCoW ensures the team knows what to build first.
Improved MVP Definition: By using EARS for precision and MoSCoW to weed out non-essential items, teams can better define the Minimum Viable Product (MVP).
Better Communication: Using both tools helps bridge the gap between technical teams (who need precise syntax) and stakeholders (who care about priority).
Effective Scope Management: MoSCoW helps prevent scope creep by identifying "Won't-have" items, while EARS ensures "Must-haves" are well-defined. 
