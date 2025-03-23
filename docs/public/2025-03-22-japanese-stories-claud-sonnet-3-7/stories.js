/**
 * Japanese Fairy Tales with Structured Translations
 * Each story contains the title, description, sentences (Japanese and English)
 */

// Collection of Japanese fairy tales
const stories = [
    {
        id: 'momotaro',
        title: '桃太郎',
        titleEn: 'Momotaro (Peach Boy)',
        description: 'The classic tale of a boy born from a peach who fights demons',
        difficulty: 'beginner',
        icon: '🍑',
        sentences: [
            {
                ja: 'むかしむかし、あるところに、おじいさんとおばあさんが住んでいました。',
                en: 'Long long ago, in a certain place, an old man and an old woman were living.',
                wordPrompt: {
                    context: 'むかしむかし、あるところに、おじいさんと_____が住んでいました。',
                    correctWord: 'おばあさん',
                    options: ['おかあさん', 'おばあさん', 'おとうさん', 'おにいさん']
                }
            },
            {
                ja: 'おじいさんは山へ芝刈りに、おばあさんは川へ洗濯に行きました。',
                en: 'To the mountain for grass cutting the old man went, to the river for laundry the old woman went.'
            },
            {
                ja: 'おばあさんが川で洗濯をしていると、大きな桃が流れてきました。',
                en: 'While the old woman at the river was doing laundry, a big peach came floating.'
            },
            {
                ja: '「これはおいしそうな桃だわ。おじいさんと一緒に食べよう」とおばあさんは言いました。',
                en: '"This is a delicious-looking peach. With the old man together I will eat it," the old woman said.'
            },
            {
                ja: 'おばあさんは桃を持ち帰り、おじいさんと切ろうとしました。',
                en: 'The old woman took the peach home, and with the old man was about to cut it.',
                wordPrompt: {
                    context: 'おばあさんは桃を_____、おじいさんと切ろうとしました。',
                    correctWord: '持ち帰り',
                    options: ['食べて', '持ち帰り', '投げて', '割って']
                }
            },
            {
                ja: 'するとびっくり、桃がパカッと割れて、中から元気な男の赤ちゃんが生まれました。',
                en: 'Then surprisingly, the peach split open, and from inside a healthy baby boy was born.'
            },
            {
                ja: '「この子は桃から生まれたので、桃太郎と名付けよう」と二人は喜びました。',
                en: '"This child from a peach was born, so Momotaro we shall name him," the two rejoiced.'
            },
            {
                ja: '桃太郎はぐんぐん育って、とても強い男の子になりました。',
                en: 'Momotaro rapidly grew, and a very strong boy he became.'
            },
            {
                ja: 'ある日、桃太郎は言いました。「鬼ヶ島へ行って、悪い鬼を退治してきます」',
                en: '"To Onigashima I will go, and the bad demons I will defeat," Momotaro said one day.'
            },
            {
                ja: 'おじいさんとおばあさんは、桃太郎にきびだんごを作ってあげました。',
                en: 'For Momotaro, millet dumplings the old man and old woman made.',
                wordPrompt: {
                    context: 'おじいさんとおばあさんは、桃太郎に_____を作ってあげました。',
                    correctWord: 'きびだんご',
                    options: ['きびだんご', 'おもちゃ', 'かたな', 'ふく']
                }
            },
            {
                ja: '桃太郎は旅に出ました。道で犬に会いました。',
                en: 'Momotaro on a journey set out. On the way, a dog he met.'
            },
            {
                ja: '「桃太郎さん、どこへ行くのですか？」と犬が尋ねました。',
                en: '"Momotaro, where are you going?" the dog asked.'
            },
            {
                ja: '「鬼ヶ島へ鬼退治に行くのだ」と桃太郎は答えました。',
                en: '"To Onigashima to defeat demons I am going," Momotaro answered.'
            },
            {
                ja: '「きびだんごを一つくれるなら、おともします」と犬は言いました。',
                en: '"If one millet dumpling you give me, your companion I will be," the dog said.'
            },
            {
                ja: '桃太郎はきびだんごを一つあげて、犬を仲間にしました。',
                en: 'One millet dumpling Momotaro gave, and the dog his companion became.'
            },
            {
                ja: '次に猿に会いました。猿も仲間になりました。',
                en: 'Next, a monkey he met. The monkey also his companion became.',
                wordPrompt: {
                    context: '次に_____に会いました。猿も仲間になりました。',
                    correctWord: '猿',
                    options: ['猿', '犬', '鳥', '鬼']
                }
            },
            {
                ja: 'そして、キジにも会いました。キジも仲間になりました。',
                en: 'And then, a pheasant he also met. The pheasant also his companion became.'
            },
            {
                ja: '桃太郎と三匹の仲間は、鬼ヶ島に着きました。',
                en: 'Momotaro and his three animal companions to Onigashima arrived.'
            },
            {
                ja: '鬼の城の前で、キジが空から攻撃し、猿が塀をよじ登り、犬が門から攻め込みました。',
                en: 'In front of the demons\' castle, from the sky the pheasant attacked, up the wall the monkey climbed, through the gate the dog charged.'
            },
            {
                ja: '桃太郎は大きな金棒を振り回す鬼の大将と戦いました。',
                en: 'Momotaro against the demon chief who a large iron club swung fought.',
                wordPrompt: {
                    context: '桃太郎は大きな_____を振り回す鬼の大将と戦いました。',
                    correctWord: '金棒',
                    options: ['刀', 'つるぎ', '金棒', 'やり']
                }
            },
            {
                ja: '桃太郎は強かったので、鬼の大将はすぐに負けてしまいました。',
                en: 'Because Momotaro was strong, the demon chief quickly was defeated.'
            },
            {
                ja: '「命だけは助けてください。悪いことはもうしません。宝物をあげます」と鬼の大将は言いました。',
                en: '"My life only please spare. Bad things I will do no more. Treasures I will give you," the demon chief said.'
            },
            {
                ja: '桃太郎は鬼から宝物をもらい、人々が盗まれた宝物を取り戻しました。',
                en: 'From the demons treasures Momotaro received, and the stolen treasures of the people retrieved.'
            },
            {
                ja: '桃太郎はおじいさんとおばあさんのところに帰りました。',
                en: 'To the old man and old woman Momotaro returned.'
            },
            {
                ja: '「ただいま。鬼を退治してきました」と桃太郎は言いました。',
                en: '"I\'m home. The demons I have defeated," Momotaro said.',
                wordPrompt: {
                    context: '「_____。鬼を退治してきました」と桃太郎は言いました。',
                    correctWord: 'ただいま',
                    options: ['さようなら', 'おはよう', 'ただいま', 'ごめんなさい']
                }
            },
            {
                ja: 'おじいさんとおばあさんはとても喜びました。',
                en: 'The old man and old woman very happy were.'
            },
            {
                ja: 'そして、桃太郎とおじいさんとおばあさんは幸せに暮らしました。',
                en: 'And then, Momotaro and the old man and old woman happily lived.'
            }
        ]
    },
    {
        id: 'kaguya-hime',
        title: 'かぐや姫',
        titleEn: 'Princess Kaguya',
        description: 'The tale of a mysterious princess found in a bamboo stalk',
        difficulty: 'intermediate',
        icon: '🌙',
        sentences: [
            {
                ja: 'むかしむかし、あるところに、竹取りのおじいさんが住んでいました。',
                en: 'Long long ago, in a certain place, a bamboo cutter old man was living.'
            },
            {
                ja: 'おじいさんは毎日、山に竹を取りに行っていました。',
                en: 'Every day to the mountain for bamboo cutting the old man was going.'
            },
            {
                ja: 'ある日、おじいさんは光る竹を見つけました。',
                en: 'One day, a glowing bamboo the old man found.',
                wordPrompt: {
                    context: 'ある日、おじいさんは_____竹を見つけました。',
                    correctWord: '光る',
                    options: ['光る', '長い', '古い', '緑の']
                }
            },
            {
                ja: '「なんて不思議な竹だろう」と言って、おじいさんはその竹を切りました。',
                en: '"What a mysterious bamboo this is," saying, the old man that bamboo cut.'
            },
            {
                ja: 'すると、竹の中から小さな女の子が出てきました。',
                en: 'Then, from inside the bamboo a small girl came out.'
            },
            {
                ja: '女の子はとても美しく、手のひらに乗るほど小さかったです。',
                en: 'The girl was very beautiful, and small enough to fit in a palm she was.'
            },
            {
                ja: 'おじいさんは女の子を家に持ち帰りました。',
                en: 'The old man the girl to his home took.'
            },
            {
                ja: 'おじいさんとおばあさんは女の子を「かぐや姫」と名付けて、大切に育てました。',
                en: 'The old man and old woman the girl "Princess Kaguya" named, and carefully raised her.',
                wordPrompt: {
                    context: 'おじいさんとおばあさんは女の子を「_____」と名付けて、大切に育てました。',
                    correctWord: 'かぐや姫',
                    options: ['かぐや姫', '桃太郎', 'かめ子', '雪姫']
                }
            },
            {
                ja: 'かぐや姫はあっという間に成長して、美しい女性になりました。',
                en: 'Princess Kaguya in no time grew, and a beautiful woman became.'
            },
            {
                ja: 'かぐや姫の美しさの評判は広まり、多くの貴公子が求婚に訪れました。',
                en: 'Of Princess Kaguya\'s beauty the reputation spread, and many nobles to propose came.'
            },
            {
                ja: 'かぐや姫は五人の貴公子に難しい宝物を探してくるように言いました。',
                en: 'To five noble men difficult treasures to find and bring back Princess Kaguya told.'
            },
            {
                ja: '一人目の貴公子には、仏の石の鉢を持ってくるように言いました。',
                en: 'To the first noble man, Buddha\'s stone bowl to bring she instructed.'
            },
            {
                ja: '二人目の貴公子には、蓬莱山の銀の枝を持ってくるように言いました。',
                en: 'To the second noble man, from Mount Horai a silver branch to bring she instructed.',
                wordPrompt: {
                    context: '二人目の貴公子には、蓬莱山の_____の枝を持ってくるように言いました。',
                    correctWord: '銀',
                    options: ['銀', '金', '銅', '木']
                }
            },
            {
                ja: '三人目の貴公子には、火鼠の皮衣を持ってくるように言いました。',
                en: 'To the third noble man, a fire-rat\'s fur coat to bring she instructed.'
            },
            {
                ja: '四人目の貴公子には、竜の首の玉を持ってくるように言いました。',
                en: 'To the fourth noble man, a dragon\'s neck jewel to bring she instructed.'
            },
            {
                ja: '五人目の貴公子には、つばめの子安貝を持ってくるように言いました。',
                en: 'To the fifth noble man, a swallow\'s cowry shell to bring she instructed.'
            },
            {
                ja: 'しかし、どの貴公子も本物の宝物を持ってくることができませんでした。',
                en: 'However, not one of the noble men the real treasures could bring.'
            },
            {
                ja: '帝もかぐや姫の美しさを聞いて、会いに来ました。',
                en: 'The Emperor also about Princess Kaguya\'s beauty heard, and to meet her came.',
                wordPrompt: {
                    context: '_____もかぐや姫の美しさを聞いて、会いに来ました。',
                    correctWord: '帝',
                    options: ['帝', '王子', '将軍', '武士']
                }
            },
            {
                ja: 'かぐや姫と帝は仲良くなりましたが、かぐや姫は宮殿に行くことを断りました。',
                en: 'Princess Kaguya and the Emperor became close, but going to the palace Princess Kaguya refused.'
            },
            {
                ja: 'ある晩、かぐや姫は月を見て泣いていました。',
                en: 'One night, at the moon looking Princess Kaguya was crying.'
            },
            {
                ja: 'おじいさんが「どうしたの？」と聞くと、かぐや姫は「私は月の世界の人です。もうすぐ迎えが来ます」と答えました。',
                en: '"What\'s wrong?" when the old man asked, "I am a person from the world of the moon. Soon someone will come for me," Princess Kaguya answered.'
            },
            {
                ja: 'おじいさんとおばあさんはとても悲しみました。帝も悲しみました。',
                en: 'The old man and old woman very sad became. The Emperor also sad became.'
            },
            {
                ja: '十五夜の晩、月からかぐや姫を迎えに天人がたくさん降りてきました。',
                en: 'On the night of the full moon, from the moon to welcome Princess Kaguya many heavenly beings descended.'
            },
            {
                ja: 'かぐや姫は帝に手紙と不死の薬を残しました。',
                en: 'To the Emperor a letter and the elixir of immortality Princess Kaguya left.',
                wordPrompt: {
                    context: 'かぐや姫は帝に手紙と_____の薬を残しました。',
                    correctWord: '不死',
                    options: ['不死', '長生き', '若返り', '病気']
                }
            },
            {
                ja: '天人はかぐや姫に羽衣を着せ、月へと連れて行きました。',
                en: 'The heavenly beings on Princess Kaguya a feather robe dressed, and to the moon took her.'
            },
            {
                ja: '帝は悲しみのあまり、不死の薬を富士山の頂上で燃やしました。',
                en: 'The Emperor in great sorrow, the elixir of immortality at the top of Mount Fuji burned.'
            },
            {
                ja: 'だから今でも、富士山からは煙が出ていると言われています。',
                en: 'That is why even now, from Mount Fuji smoke comes out, it is said.'
            }
        ]
    },
    {
        id: 'urashima-taro',
        title: '浦島太郎',
        titleEn: 'Urashima Taro',
        description: 'The story of a fisherman who rescues a turtle and visits a palace under the sea',
        difficulty: 'beginner',
        icon: '🐢',
        sentences: [
            {
                ja: 'むかしむかし、ある海辺の村に浦島太郎という若い漁師が住んでいました。',
                en: 'Long long ago, in a certain seaside village a young fisherman named Urashima Taro was living.'
            },
            {
                ja: '浦島太郎はとても優しい心を持っていました。',
                en: 'Urashima Taro a very kind heart had.'
            },
            {
                ja: 'ある日、浜辺で子どもたちが小さな亀をいじめているのを見かけました。',
                en: 'One day, on the beach some children bullying a small turtle he saw.',
                wordPrompt: {
                    context: 'ある日、浜辺で子どもたちが小さな_____をいじめているのを見かけました。',
                    correctWord: '亀',
                    options: ['亀', '猫', '犬', '鳥']
                }
            },
            {
                ja: '「その亀をいじめないで」と浦島太郎は言って、亀を助けました。',
                en: '"That turtle do not bully," Urashima Taro said, and the turtle saved.'
            },
            {
                ja: '浦島太郎は亀を海に返してあげました。',
                en: 'Urashima Taro the turtle to the sea returned.'
            },
            {
                ja: '次の日、浦島太郎が海で漁をしていると、助けた亀が現れました。',
                en: 'The next day, when Urashima Taro at sea was fishing, the turtle he had saved appeared.'
            },
            {
                ja: '亀は言いました。「昨日は助けてくれてありがとう。お礼に竜宮城へご案内します」',
                en: '"For saving me yesterday thank you. As thanks to Ryugu Palace I will guide you," the turtle said.'
            },
            {
                ja: '浦島太郎は亀の背中に乗って、海の底に向かいました。',
                en: 'On the turtle\'s back Urashima Taro rode, and toward the bottom of the sea headed.',
                wordPrompt: {
                    context: '浦島太郎は亀の_____に乗って、海の底に向かいました。',
                    correctWord: '背中',
                    options: ['背中', '頭', '足', '手']
                }
            },
            {
                ja: '海の底には美しい竜宮城がありました。',
                en: 'At the bottom of the sea a beautiful Ryugu Palace there was.'
            },
            {
                ja: '竜宮城の乙姫様が浦島太郎を迎えてくれました。',
                en: 'The Princess of Ryugu Palace Urashima Taro welcomed.'
            },
            {
                ja: '乙姫様は言いました。「昨日助けてくれた亀は私の使いでした。どうぞごゆっくり滞在してください」',
                en: '"The turtle you saved yesterday was my messenger. Please stay and enjoy yourself," Princess Otohime said.'
            },
            {
                ja: '浦島太郎は竜宮城での生活をとても楽しみました。',
                en: 'Life at Ryugu Palace Urashima Taro very much enjoyed.'
            },
            {
                ja: '美味しい料理を食べたり、楽しい踊りを見たり、美しい庭園を散歩したりしました。',
                en: 'Delicious food he ate, enjoyable dances he watched, in beautiful gardens he walked.'
            },
            {
                ja: 'しかし、数日後、浦島太郎はふるさとと両親のことを思い出しました。',
                en: 'However, after several days, of his hometown and parents Urashima Taro remembered.',
                wordPrompt: {
                    context: 'しかし、数日後、浦島太郎は_____と両親のことを思い出しました。',
                    correctWord: 'ふるさと',
                    options: ['ふるさと', '友達', '海', '船']
                }
            },
            {
                ja: '「乙姫様、とても楽しかったですが、もう家に帰らなければなりません」と浦島太郎は言いました。',
                en: '"Princess Otohime, very enjoyable it has been, but now home I must return," Urashima Taro said.'
            },
            {
                ja: '乙姫様は残念そうでしたが、帰りたいという浦島太郎の気持ちを理解しました。',
                en: 'Princess Otohime seemed disappointed, but Urashima Taro\'s feelings about wanting to return home she understood.'
            },
            {
                ja: '「これはあなたへの贈り物です。でも、決して開けないでくださいね」と言って、乙姫様は玉手箱をくれました。',
                en: '"This is a gift for you. But never open it, please," saying, Princess Otohime a mysterious box gave him.'
            },
            {
                ja: '亀は浦島太郎を再び背中に乗せて、浜辺まで連れて行きました。',
                en: 'The turtle Urashima Taro again on its back carried, and to the beach took him.'
            },
            {
                ja: '浦島太郎が浜に着くと、なにもかもが変わっていました。',
                en: 'When Urashima Taro at the beach arrived, everything had changed.'
            },
            {
                ja: '見覚えのある家々はなく、知っている人も誰一人いませんでした。',
                en: 'Familiar houses were not there, and people he knew not one was there.',
                wordPrompt: {
                    context: '見覚えのある_____はなく、知っている人も誰一人いませんでした。',
                    correctWord: '家々',
                    options: ['家々', '海', '木', '山']
                }
            },
            {
                ja: '浦島太郎は困って、村人に尋ねました。「浦島太郎という漁師を知っていますか？」',
                en: 'Troubled, to a villager Urashima Taro asked, "A fisherman named Urashima Taro do you know?"'
            },
            {
                ja: '村人は答えました。「浦島太郎？ああ、それは三百年前に亀を助けて、海に消えた人の話ですね」',
                en: '"Urashima Taro? Ah, that is the story of a man who three hundred years ago saved a turtle and disappeared into the sea," the villager answered.'
            },
            {
                ja: '浦島太郎は驚きました。竜宮城での数日が、この世界では三百年だったのです。',
                en: 'Urashima Taro was surprised. Several days at Ryugu Palace, in this world three hundred years had been.'
            },
            {
                ja: '途方に暮れた浦島太郎は、乙姫様からもらった玉手箱のことを思い出しました。',
                en: 'At a loss for what to do, of the mysterious box from Princess Otohime Urashima Taro remembered.'
            },
            {
                ja: '「もう何も残っていないなら、この箱を開けてみよう」と浦島太郎は考えました。',
                en: '"If nothing remains anymore, this box I will open," Urashima Taro thought.'
            },
            {
                ja: '浦島太郎が玉手箱を開けると、中から白い煙が出てきました。',
                en: 'When Urashima Taro the box opened, from inside white smoke came out.',
                wordPrompt: {
                    context: '浦島太郎が玉手箱を開けると、中から_____が出てきました。',
                    correctWord: '白い煙',
                    options: ['宝物', '白い煙', 'お金', '手紙']
                }
            },
            {
                ja: 'その瞬間、浦島太郎は白髪の老人に変わってしまいました。',
                en: 'At that moment, into a white-haired old man Urashima Taro transformed.'
            },
            {
                ja: '実は玉手箱の中には浦島太郎の年齢が入っていたのです。',
                en: 'Actually, inside the box Urashima Taro\'s age was contained.'
            },
            {
                ja: 'こうして浦島太郎は長い長い人生を終えたのでした。',
                en: 'And so, a long, long life Urashima Taro ended.'
            }
        ]
    }
];

// Get all available stories
function getAllStories() {
    return stories;
}

// Get a specific story by ID
function getStoryById(id) {
    return stories.find(story => story.id === id);
}

// Get total sentences in a story
function getStorySentenceCount(storyId) {
    const story = getStoryById(storyId);
    return story ? story.sentences.length : 0;
}

// Get word prompts from a story
function getStoryWordPrompts(storyId) {
    const story = getStoryById(storyId);
    if (!story) return [];
    
    return story.sentences
        .filter(sentence => sentence.wordPrompt)
        .map(sentence => sentence.wordPrompt);
}

// Process Japanese text to add furigana (in a real app, this would use a proper library)
function addFurigana(text) {
    // This is a simplified example - in a real app you'd use a proper Japanese parsing library
    // Here, we'll just add furigana to a few common kanji as an example
    const kanjiMap = {
        '桃': { reading: 'もも', meaning: 'peach' },
        '太郎': { reading: 'たろう', meaning: 'Taro' },
        '川': { reading: 'かわ', meaning: 'river' },
        '山': { reading: 'やま', meaning: 'mountain' },
        '鬼': { reading: 'おに', meaning: 'demon' },
        '島': { reading: 'しま', meaning: 'island' },
        '竹': { reading: 'たけ', meaning: 'bamboo' },
        '姫': { reading: 'ひめ', meaning: 'princess' },
        '月': { reading: 'つき', meaning: 'moon' },
        '浦': { reading: 'うら', meaning: 'bay' },
        '亀': { reading: 'かめ', meaning: 'turtle' },
        '海': { reading: 'うみ', meaning: 'sea' },
        '城': { reading: 'しろ', meaning: 'castle' },
        '乙': { reading: 'おと', meaning: 'strange/mysterious' }
    };
    
    let result = '';
    let i = 0;
    
    while (i < text.length) {
        let found = false;
        
        // Check for multi-character kanji compounds first
        for (let len = 2; len > 0; len--) {
            if (i + len <= text.length) {
                const compound = text.substring(i, i + len);
                if (kanjiMap[compound]) {
                    result += `<span class="kanji-container">${compound}<span class="furigana">${kanjiMap[compound].reading}</span></span>`;
                    i += len;
                    found = true;
                    break;
                }
            }
        }
        
        // If no kanji compound found, add the character as is
        if (!found) {
            result += text[i];
            i++;
        }
    }
    
    return result;
}

// Save user's story progress
function saveStoryProgress(storyId, sentencesRead, correctAnswers, totalPrompts) {
    const storyProgress = getStoryProgress();
    
    storyProgress[storyId] = {
        sentencesRead: sentencesRead,
        correctAnswers: correctAnswers,
        totalPrompts: totalPrompts,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('nihongo_story_progress', JSON.stringify(storyProgress));
}

// Get user's story progress
function getStoryProgress() {
    const progress = localStorage.getItem('nihongo_story_progress');
    return progress ? JSON.parse(progress) : {};
}

// Save user settings
function saveUserSettings(settings) {
    localStorage.setItem('nihongo_story_settings', JSON.stringify(settings));
}

// Get user settings
function getUserSettings() {
    const settings = localStorage.getItem('nihongo_story_settings');
    return settings ? JSON.parse(settings) : {
        promptFrequency: 8,
        readingSpeed: 5,
        showFurigana: true,
        audioVolume: 80
    };
}

