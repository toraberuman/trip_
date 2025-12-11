import { GoogleGenAI, Type } from "@google/genai";
import { TripData } from "../types";

const parseCSVToItinerary = async (csvText: string): Promise<TripData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert travel assistant. Analyze the following CSV travel itinerary for a group trip of 6 people.
    
    Your task is to convert this raw data into a rich, structured JSON itinerary.
    
    CRITICAL INSTRUCTIONS:
    1. **Dates & Calendar**: 
       - The trip starts on **October 28, 2025**.
       - **Day 1**: 28 (Tue)
       - **Day 2**: 29 (Wed)
       - **Day 3**: 30 (Thu)
       - **Day 4**: 31 (Fri)
       - **Day 5**: 1 (Sat) [November]
       - **Day 6**: 2 (Sun)
       - **Day 7**: 3 (Mon)
       - **Day 8**: 4 (Tue)
       - 'dayNumber': Just the digit (e.g., "28", "1").
       - 'dayOfWeek': 3-letter UPPERCASE English Abbreviation (e.g., TUE, WED).
       - 'month': "10月" (Primary month).
       
    2. **Activity Titles**: 
       - 'activity' field MUST be the concise official name of the location or shop.
       - Do NOT use sentences. Move descriptions to 'notes'.
       
    3. **Japanese Data**: 
       - 'japaneseName' (Kanji) and 'hiragana' (Reading) are MANDATORY for all Japanese locations.
       
    4. **Universal Business Info (Restaurants & Spots)**:
       - **MANDATORY**: Extract or Estimate 'openingHours', 'holidays' (Regular closing days like "週一公休"), and 'lastOrder' (for restaurants).
       - 'phoneNumber' is Crucial for Car Navigation.
       
    5. **Navigation**:
       - 'estimatedArrivalTime': Calculate the likely arrival time at this location based on previous event + travel time (Format HH:MM).
       - 'trafficStatus': Estimate realistic traffic based on location/time. Use 'normal' (Green), 'moderate' (Orange), or 'congested' (Red).
       
    6. **Hotels & Onsen**:
       - 'rooms': Extract distinct room types.
       - 'mealPlan': Extract specific meal info (e.g., "素泊", "一泊二食").
       - 'onsen': Look for "貸切", "露天".
       
    7. **Restaurants**:
       - 'tabelogUrl': If not provided, generate a search URL.
       
    CSV Data:
    \`\`\`csv
    ${csvText}
    \`\`\`
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are a travel expert. Output JSON only. Use Traditional Chinese for descriptions.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tripTitle: { type: Type.STRING },
          year: { type: Type.STRING },
          month: { type: Type.STRING },
          participants: { type: Type.NUMBER },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                dayOfWeek: { type: Type.STRING },
                dayNumber: { type: Type.STRING },
                dayTitle: { type: Type.STRING },
                summary: { type: Type.STRING },
                location: { type: Type.STRING },
                imageKeyword: { type: Type.STRING },
                coordinates: {
                   type: Type.OBJECT,
                   properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } }
                },
                events: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      time: { type: Type.STRING },
                      endTime: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      location: { type: Type.STRING },
                      notes: { type: Type.STRING },
                      category: { type: Type.STRING, enum: ["TRANSPORT", "FOOD", "ACTIVITY", "STAY", "OTHER"] },
                      emoji: { type: Type.STRING },
                      estimatedTravelTime: { type: Type.STRING },
                      estimatedArrivalTime: { type: Type.STRING },
                      distance: { type: Type.STRING },
                      trafficStatus: { type: Type.STRING, enum: ["normal", "moderate", "congested"] },
                      details: {
                        type: Type.OBJECT,
                        properties: {
                          japaneseName: { type: Type.STRING },
                          hiragana: { type: Type.STRING },
                          address: { type: Type.STRING },
                          phoneNumber: { type: Type.STRING },
                          openingHours: { type: Type.STRING },
                          holidays: { type: Type.STRING },
                          lastOrder: { type: Type.STRING },
                          reservationUrl: { type: Type.STRING },
                          tabelogUrl: { type: Type.STRING },
                          websiteUrl: { type: Type.STRING },
                          isReserved: { type: Type.BOOLEAN },
                          mealPlan: { type: Type.STRING },
                          rooms: { 
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    imageUrl: { type: Type.STRING },
                                    link: { type: Type.STRING }
                                }
                            }
                          },
                          onsen: {
                            type: Type.OBJECT,
                            properties: {
                              hasPrivateBath: { type: Type.BOOLEAN },
                              hasOpenAir: { type: Type.BOOLEAN },
                              bathName: { type: Type.STRING },
                              hours: { type: Type.STRING },
                              genderSwap: { type: Type.STRING },
                              privateBathFee: { type: Type.STRING }
                            }
                          },
                          transportInfo: {
                              type: Type.OBJECT,
                              properties: {
                                  departureTerminal: { type: Type.STRING },
                                  arrivalTerminal: { type: Type.STRING },
                                  flightNumber: { type: Type.STRING }
                              }
                          },
                          carRental: {
                              type: Type.OBJECT,
                              properties: {
                                  model: { type: Type.STRING },
                                  company: { type: Type.STRING },
                                  pickupLocation: { type: Type.STRING },
                                  dropoffLocation: { type: Type.STRING }
                              }
                          },
                          hotelActivities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    imageUrl: { type: Type.STRING }
                                }
                            }
                          },
                          popularDishes: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                original: { type: Type.STRING },
                                translated: { type: Type.STRING }
                              }
                            }
                          },
                          coordinates: {
                             type: Type.OBJECT,
                             properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } }
                          }
                        }
                      },
                      expense: {
                        type: Type.OBJECT,
                        properties: {
                          amountPerPerson: { type: Type.NUMBER },
                          peopleCount: { type: Type.NUMBER },
                          total: { type: Type.NUMBER },
                          currency: { type: Type.STRING },
                          method: { type: Type.STRING, enum: ["CASH", "CARD"] },
                          isEstimate: { type: Type.BOOLEAN }
                        }
                      }
                    },
                    required: ["time", "activity", "category", "details", "expense", "id"]
                  }
                }
              },
              required: ["date", "events", "coordinates"]
            }
          }
        },
        required: ["tripTitle", "days"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No data returned from AI");
  }

  try {
    return JSON.parse(text) as TripData;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to parse itinerary data.");
  }
};

export { parseCSVToItinerary };