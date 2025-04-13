const faithGroups = ['Good', 'Evil', 'Gnostic'];

const faithTitles = ['The Golden Crown', 'The Black Crown', 'Sethianism'];
const faithImg = ['./public/mfi_prestige.png', './public/mfi_ruthless.png', './public/mfi_sethianism.png'];
const faithTxt = ['This is the faith of the Golden Crown.', 'The faith of the Black Crown.', 'Gnostics'];
const groupingRef = ['Good', 'Evil', 'Gnostic']

function createFaith(id, title, img, txt, group){
    return {
        id:id,
        title:title,
        img:img,
        txt:txt,
        group:group
    }
}
let faiths = []
for(let i=0; i<faithTitles.length; i++){
    id=i
    const faith = createFaith(id, faithTitles[i], faithImg[i], faithTxt[i], groupingRef[i])
    faiths.push(faith)
}

module.exports = {faiths}