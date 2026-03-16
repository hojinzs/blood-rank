export type BloodType = 'A' | 'B' | 'O' | 'AB';

export const getTitleCopy = (firstPlaceType: BloodType) => {
  switch (firstPlaceType) {
    case 'A': return 'A형은 역시 다정다감해';
    case 'B': return 'B형의 솔직한 온기가 빛나요';
    case 'O': return 'O형은 역시 열정이 남달라';
    case 'AB': return 'AB형의 특별한 매력이 보이네요';
  }
}

export const getCardCopy = (type: BloodType, rank: number) => {
  const matrix: Record<BloodType, Record<number, string>> = {
    A: {
      1: "역시 A형. 세심하게 챙긴 마음이 오늘도 1위로 이어졌네요.",
      2: "A형 오늘도 든든해요. 조금만 더 힘내면 금방 1위도 보여요.",
      3: "A형 3위예요. 망설이지 말고 한 번만 더 마음 써주면 금방 올라가요.",
      4: "A형이 조금 지쳤나 봐요. 우리 다정함 한 번 더 보태서 순위를 올려봐요.",
    },
    B: {
      1: "의외라고요? 아니요. B형은 마음먹으면 이렇게 멋지게 해내잖아요.",
      2: "B형 2위예요. 지금 페이스도 좋지만 조금만 더 가면 1위도 가능해요.",
      3: "B형 3위예요. 우리 팀 감각 믿고 한 번 더 힘내보면 좋겠어요.",
      4: "B형 차례를 기다리고 있었어요. 이번엔 팀을 위해 한 번 나서볼까요?",
    },
    O: {
      1: "역시 O형. 시원한 추진력이 오늘 팀을 맨 앞으로 이끌었네요.",
      2: "O형 2위예요. 리더다운 기세는 충분하니 한 걸음만 더 내디뎌봐요.",
      3: "O형 3위예요. 잠깐 숨 고르는 중이라면, 다시 힘내서 치고 올라가요.",
      4: "O형이 조금 뒤에 있어요. 특유의 에너지로 분위기를 다시 끌어올려봐요.",
    },
    AB: {
      1: "오늘은 AB형의 특별함이 제대로 빛나네요. 기분 좋은 반전이에요.",
      2: "AB형 2위예요. 흐름이 좋아서 오늘은 더 기대하게 되네요.",
      3: "AB형 3위예요. 센스 있는 선택 한 번이면 순위가 또 달라질 수 있어요.",
      4: "AB형이 잠시 숨 고르는 중인가 봐요. 이번엔 다정한 한 걸음으로 힘을 보태줘요.",
    }
  };
  return matrix[type]?.[rank] || '';
}

export const getBloodTypeColor = (type: BloodType) => {
  switch (type) {
    case 'A': return 'bg-rose-500 text-white border-rose-600';
    case 'B': return 'bg-blue-500 text-white border-blue-600';
    case 'O': return 'bg-amber-500 text-white border-amber-600';
    case 'AB': return 'bg-purple-500 text-white border-purple-600';
  }
}
