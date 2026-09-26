# A00 Component catalog

The following IDs and Unicode sequences are the implemented source of truth. None entries omit their row.

## D00 Head (h)

| ID | Label | Code points |
| --- | --- | --- |
| none | None | Empty |
| cap | Cap | U+1F9E2 |
| top-hat | Top Hat | U+1F3A9 |
| graduation | Graduation Cap | U+1F393 |
| crown | Crown | U+1F451 |
| helmet | Safety Helmet | U+26D1 U+FE0F |
| scarf | Scarf | U+1F9E3 |

## E00 Expression (e)

| ID | Label | Code points |
| --- | --- | --- |
| request | Request | U+1F97A |
| appreciative | Appreciative | U+1F60A |
| hopeful | Hopeful | U+1F929 |
| patient | Patient | U+1F642 |
| relieved | Relieved | U+1F60C |
| focused | Focused | U+1F9D0 |
| confident | Confident | U+1F60E |
| concerned | Concerned | U+1F61F |
| unsure | Unsure | U+1F914 |
| surprised | Surprised | U+1F62E |
| tired | Tired | U+1F634 |
| positive | Positive | U+1F604 |

## F00 Gesture (g)

| ID | Label | Code points |
| --- | --- | --- |
| none | None | Empty |
| request-hands | Request | U+1F932 |
| thanks | Thanks | U+1F64F |
| agreement | Agreement | U+1F44D |
| open-palms | Open Palms | U+1F450 |
| appreciation | Appreciation | U+1F44F |
| handshake | Handshake | U+1F91D |
| celebrate | Celebrate | U+1F64C |
| hopeful | Hopeful | U+1F91E |
| acknowledged | Acknowledged | U+1F44C |
| hello | Hello | U+1F44B |
| attention | Attention | U+261D U+FE0F |
| done | Done | U+270C U+FE0F |

## G00 Clothing (c)

| ID | Label | Code points |
| --- | --- | --- |
| none | None | Empty |
| shorts | Shorts | U+1FA73 |
| jeans | Jeans | U+1F456 |
| business | Business Attire | U+1F454 |
| coat | Coat | U+1F9E5 |
| vest | Safety Vest | U+1F9BA |
| lab-coat | Lab Coat | U+1F97C |
| shirt | T-shirt | U+1F455 |

## H00 Footwear (f)

| ID | Label | Code points |
| --- | --- | --- |
| none | None | Empty |
| ballet | Ballet Shoes | U+1FA70 |
| formal | Formal Shoes | U+1F45E |
| sneakers | Sneakers | U+1F45F |
| boots | Boots | U+1F462 |
| hiking | Hiking Boots | U+1F97E |

## I00 Context (x)

| ID | Label | Code points |
| --- | --- | --- |
| none | None | Empty |
| document | Document | U+1F4C4 |
| clock | Clock | U+1F552 |
| hourglass | Hourglass | U+23F3 |
| check | Check Mark | U+2705 |
| calendar | Calendar | U+1F4C5 |
| bell | Bell | U+1F514 |
| magnifier | Magnifying Glass | U+1F50D |
| envelope | Envelope | U+2709 U+FE0F |
| coffee | Coffee | U+2615 |
| rocket | Rocket | U+1F680 |
| bug | Bug | U+1F41B |
| lock | Lock | U+1F512 |
| chart | Chart | U+1F4C8 |
| package | Package | U+1F4E6 |
| ticket | Ticket | U+1F3AB |

# B00 Preset definitions

The fields are Head / Expression / Gesture / Clothing / Footwear / Context.

| ID | Name | Group | Component IDs |
| --- | --- | --- | --- |
| classic | Classic Request | Follow-up | cap / request / request-hands / shorts / ballet / none |
| gentle | Gentle Reminder | Follow-up | cap / request / request-hands / shorts / ballet / clock |
| clear | Clear Reminder | Follow-up | cap / patient / attention / shorts / ballet / clock |
| urgent | Time-sensitive | Follow-up | cap / concerned / attention / shorts / ballet / hourglass |
| waiting | Patiently Waiting | Follow-up | none / patient / open-palms / coat / sneakers / hourglass |
| formal | Formal Request | Follow-up | top-hat / request / request-hands / business / formal / document |
| friday | Friday Follow-up | Follow-up | cap / relieved / hello / shirt / sneakers / calendar |
| review | Ready for Review | Review | graduation / focused / open-palms / business / formal / document |
| feedback | Waiting for Feedback | Review | cap / hopeful / hopeful / shirt / sneakers / envelope |
| reviewed | Review Complete | Review | graduation / relieved / agreement / business / formal / check |
| code | Code Review | Review | none / focused / request-hands / shirt / sneakers / bug |
| thanks | Thank You | Status | crown / appreciative / thanks / coat / ballet / none |
| approved | Approved | Status | top-hat / confident / agreement / business / formal / check |
| completed | Completed | Status | cap / positive / done / shorts / sneakers / check |
| worksite | Worksite | Fun | helmet / focused / handshake / vest / hiking / package |
| academic | Academic | Fun | graduation / focused / attention / lab-coat / formal / magnifier |
| celebration | Celebration | Fun | crown / positive / celebrate / shirt / ballet / rocket |
| coffee | Coffee Follow-up | Fun | scarf / tired / request-hands / coat / boots / coffee |
| moonwalk | The Quiet Moonwalk | Discovery | top-hat / relieved / done / shorts / ballet / rocket |
| royal | Royal Patience | Discovery | crown / patient / request-hands / coat / ballet / hourglass |
| research | Coffee Research Fellow | Discovery | graduation / focused / thanks / lab-coat / hiking / coffee |

# C00 Presentation differences

Emoji rendering belongs to the host operating system and font. The catalog uses established Unicode characters, including clothing added in recent Unicode generations. Contemporary Windows systems are the primary intended environment. Actual glyph shapes and occasional missing glyphs depend on the installed emoji font; the readable catalog labels remain available.
