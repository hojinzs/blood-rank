export type BloodType = 'A' | 'B' | 'O' | 'AB';
export const BLOOD_TYPES: BloodType[] = ['A', 'B', 'O', 'AB'];

export const isBloodType = (value: string): value is BloodType => {
  return BLOOD_TYPES.includes(value as BloodType);
};

export const getTitleCopy = (firstPlaceType: BloodType) => {
  switch (firstPlaceType) {
    case 'A': return 'A형의 다정함이 오늘도 보여요';
    case 'B': return 'B형의 솔직한 매력이 빛나는 날';
    case 'O': return 'O형의 따뜻한 열정이 앞서가요';
    case 'AB': return 'AB형의 특별한 감각이 돋보여요';
  }
}

export const getCardCopy = (type: BloodType, rank: number) => {
  const matrix: Record<BloodType, Record<number, string>> = {
    A: {
      1: "역시 A형. 세심하게 마음 써준 덕분에 오늘 1위예요.",
      2: "A형 오늘도 차분하게 잘 달리고 있어요. 조금만 더 힘내면 1위도 보여요.",
      3: "A형 지금 3위지만 아직 충분히 따라갈 수 있어요. 천천히 한 걸음만 더 가봐요.",
      4: "A형 오늘은 잠시 숨 고르는 중이네요. 마음이 닿는 순간 다시 올라올 수 있어요.",
    },
    B: {
      1: "B형, 오늘은 추진력이 제대로 빛났어요. 한 번 마음먹으니 1위네요.",
      2: "B형 2위예요. 지금 흐름도 꽤 좋아서 한 번만 더 힘내면 선두가 보여요.",
      3: "B형은 자기 페이스를 잘 아는 팀이죠. 오늘은 그 리듬에 조금만 속도를 더해봐요.",
      4: "B형 오늘은 잠깐 뒤에 있지만, 마음만 모이면 금방 분위기를 바꿀 수 있어요.",
    },
    O: {
      1: "역시 O형. 따뜻한 에너지로 오늘 1위를 이끌었네요.",
      2: "O형 2위예요. 모두를 챙기는 힘으로 선두까지 금방 닿을 수 있겠어요.",
      3: "O형 오늘은 3위지만 분위기를 끌어올릴 힘이 충분해요. 한 번 더 모여볼까요?",
      4: "O형이 잠시 숨 고르는 중이네요. 다시 치고 올라올 힘은 아직 충분해요.",
    },
    AB: {
      1: "AB형다운 반전이 또 나왔네요. 오늘의 1위, 정말 멋져요.",
      2: "AB형 2위예요. 특유의 감각이 살아나서 선두가 바로 앞까지 왔어요.",
      3: "AB형 3위예요. 지금도 충분히 좋은 흐름이니 조금만 더 보태면 달라질 거예요.",
      4: "AB형 오늘은 잠깐 조용하지만, 마음이 움직이면 가장 크게 달라질 팀이에요.",
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
